// controllers/orderController.js
import Stripe from 'stripe';
import Order from '../modals/order.js';
import Item from '../modals/item.js';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Order
export const createOrder = async (req, res) => {
    try {
        const {
            firstName, lastName, phone, email,
            address, city, zipCode,
            paymentMethod, subtotal, tax, total,
            items
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty items array' });
        }

        // Normalize incoming item structure
        const orderItems = items.map(({ item, name, price, imageUrl, quantity, itemId }) => {
            const base = item || {};
            return {
                item: {
                    name: base.name || name || 'Unknown',
                    price: Number(base.price ?? price) || 0,
                    imageUrl: base.imageUrl || imageUrl || ''
                },
                itemId: itemId || base._id || base.itemId || null,
                quantity: Number(quantity) || 0
            };
        });

        // Decrease item quantities for COD orders (immediately) or online orders (after payment confirmation)
        // For COD, decrease immediately. For online, we'll decrease in confirmPayment
        if (paymentMethod !== 'online') {
            for (const orderItem of orderItems) {
                if (orderItem.itemId) {
                    const item = await Item.findById(orderItem.itemId);
                    if (item) {
                        item.quantity = Math.max(0, item.quantity - orderItem.quantity);
                        await item.save();
                    }
                }
            }
        }

        // Default shipping cost
        const shippingCost = 0;
        let newOrder;

        if (paymentMethod === 'online') {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: orderItems.map(o => ({
                    price_data: {
                        currency: 'inr',
                        product_data: { name: o.item.name },
                        unit_amount: Math.round(o.item.price * 100)
                    },
                    quantity: o.quantity
                })),
                customer_email: email,
                success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
                metadata: { firstName, lastName, email, phone }
            });

            newOrder = new Order({
                user: req.user._id,
                firstName, lastName, phone, email,
                address, city, zipCode,
                paymentMethod, subtotal, tax, total,
                shipping: shippingCost,
                items: orderItems,
                paymentIntentId: session.payment_intent,
                sessionId: session.id,
                paymentStatus: 'pending'
            });

            await newOrder.save();
            return res.status(201).json({ order: newOrder, checkoutUrl: session.url });
        }

        // COD Handling
        newOrder = new Order({
            user: req.user._id,
            firstName, lastName, phone, email,
            address, city, zipCode,
            paymentMethod, subtotal, tax, total,
            shipping: shippingCost,
            items: orderItems,
            paymentStatus: 'succeeded'
        });

        await newOrder.save();
        res.status(201).json({ order: newOrder, checkoutUrl: null });
    } catch (error) {
        console.error('createOrder error:', error);
        // ...error handling unchanged...
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Confirm Payment
export const confirmPayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: 'session_id required' });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const order = await Order.findOneAndUpdate(
                { sessionId: session_id },
                { paymentStatus: 'succeeded' },
                { new: true }
            );
            if (!order) return res.status(404).json({ message: 'Order not found' });
            
            // Decrease item quantities now that payment is confirmed
            for (const orderItem of order.items) {
                if (orderItem.itemId) {
                    const item = await Item.findById(orderItem.itemId);
                    if (item) {
                        item.quantity = Math.max(0, item.quantity - orderItem.quantity);
                        await item.save();
                    }
                }
            }
            
            return res.json(order);
        }
        return res.status(400).json({ message: 'Payment not completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get Orders
export const getOrders = async (req, res) => {
    try {
        // only return orders belonging to this user
        const filter = { user: req.user._id };
        const rawOrders = await Order.find(filter).sort({ createdAt: -1 }).lean();

        // Format for front-end
        const host = `${req.protocol}://${req.get('host')}`;
        const formatted = rawOrders.map(o => ({
            ...o,
            items: o.items.map(i => ({
                _id: i._id,
                item: {
                    ...i.item,
                    imageUrl: i.item.imageUrl ? host + i.item.imageUrl : ''
                },
                quantity: i.quantity
            })),
            createdAt: o.createdAt,
            paymentStatus: o.paymentStatus
        }));

        res.json(formatted);
    } catch (error) {
        console.error('getOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const raw = await Order
            .find({})
            .sort({ createdAt: -1 })
            .lean();

        const formatted = raw.map(o => ({
            _id: o._id,
            user: o.user,
            firstName: o.firstName,
            lastName: o.lastName,
            email: o.email,
            phone: o.phone,

            // ← ADD these three:
            address: o.address ?? o.shippingAddress?.address ?? '',
            city: o.city ?? o.shippingAddress?.city ?? '',
            zipCode: o.zipCode ?? o.shippingAddress?.zipCode ?? '',

            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            status: o.status,
            createdAt: o.createdAt,

            items: o.items.map(i => ({
                _id: i._id,
                item: i.item,
                quantity: i.quantity
            }))
        }));

        res.json(formatted);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// NEW: updateAnyOrder — no ownership check
export const updateAnyOrder = async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(updated);
    } catch (error) {
        console.error('updateAnyOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.query.email && order.email !== req.query.email) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update Order
export const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.body.email && order.email !== req.body.email) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        console.error('updateOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Cancel Order (for users - only their own orders)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Check ownership (user can only cancel their own orders)
        if (!order.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied. You can only cancel your own orders.' });
        }

        // Check if order can be cancelled
        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Cannot cancel a delivered order' });
        }

        // Handle refund for online payments if payment was successful
        if (order.paymentMethod === 'online' && order.paymentStatus === 'succeeded' && order.paymentIntentId) {
            try {
                // Refund the payment through Stripe
                const refund = await stripe.refunds.create({
                    payment_intent: order.paymentIntentId,
                });
                console.log('Refund processed:', refund.id);
            } catch (stripeError) {
                console.error('Stripe refund error:', stripeError);
                // Continue with cancellation even if refund fails (log the error)
            }
        }

        // Restore item quantities
        for (const orderItem of order.items) {
            if (orderItem.itemId) {
                const item = await Item.findById(orderItem.itemId);
                if (item) {
                    item.quantity = item.quantity + orderItem.quantity;
                    await item.save();
                }
            }
        }

        // Update order status to cancelled
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );

        res.json({ message: 'Order cancelled successfully', order: updated });
    } catch (error) {
        console.error('cancelOrder error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Cancel Order (for admin - can cancel any order)
export const cancelOrderAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Check if order can be cancelled
        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Cannot cancel a delivered order' });
        }

        // Handle refund for online payments if payment was successful
        if (order.paymentMethod === 'online' && order.paymentStatus === 'succeeded' && order.paymentIntentId) {
            try {
                // Refund the payment through Stripe
                const refund = await stripe.refunds.create({
                    payment_intent: order.paymentIntentId,
                });
                console.log('Refund processed:', refund.id);
            } catch (stripeError) {
                console.error('Stripe refund error:', stripeError);
                // Continue with cancellation even if refund fails (log the error)
            }
        }

        // Restore item quantities
        for (const orderItem of order.items) {
            if (orderItem.itemId) {
                const item = await Item.findById(orderItem.itemId);
                if (item) {
                    item.quantity = item.quantity + orderItem.quantity;
                    await item.save();
                }
            }
        }

        // Update order status to cancelled
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );

        res.json({ message: 'Order cancelled successfully', order: updated });
    } catch (error) {
        console.error('cancelOrderAdmin error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};