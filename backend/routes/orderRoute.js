import express from 'express';
import {
    createOrder,
    getOrders,
    getAllOrders,
    confirmPayment,
    getOrderById,
    updateOrder,
    updateAnyOrder
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js'
import adminAuthMiddleware from '../middleware/adminAuth.js'

const orderRouter = express.Router();

// Admin only
orderRouter.get('/getall', adminAuthMiddleware, getAllOrders);
orderRouter.put('/getall/:id', adminAuthMiddleware, updateAnyOrder);

// Protected routes
orderRouter.use(authMiddleware);
orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/confirm', confirmPayment);
orderRouter.get('/:id', getOrderById);
orderRouter.put('/:id', updateOrder);

export default orderRouter;