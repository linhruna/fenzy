import Item from '../modals/item.js';

export const createItem = async (req, res, next) => {
    try {
        const { name, description, category, price, rating, hearts, quantity } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const total = Number(price) * 1;

        const newItem = new Item({
            name,
            description,
            category,
            price,
            rating,
            hearts,
            quantity,
            imageUrl,
            total,
        });

        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: 'Item name already exists' });
        } else next(err);
    }
};

export const getItems = async (_req, res, next) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        const host = `${_req.protocol}://${_req.get('host')}`;
        const withFullUrl = items.map(i => ({
            ...i.toObject(),
            imageUrl: i.imageUrl ? host + i.imageUrl : '',
        }));
        res.json(withFullUrl);
    } catch (err) {
        next(err);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const removed = await Item.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).json({ message: 'Item not found' });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};

// Update toàn bộ item (có thể có ảnh mới)
export const updateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, rating, hearts, quantity } = req.body;

        // Tìm item hiện tại để giữ lại imageUrl cũ
        const existingItem = await Item.findById(id);
        if (!existingItem) return res.status(404).json({ message: 'Item not found' });

        // Nếu có file mới được upload, dùng file mới; nếu không giữ lại ảnh cũ
        const imageUrl = req.file 
            ? `/uploads/${req.file.filename}` 
            : existingItem.imageUrl;

        // Tính lại total nếu cần
        const total = Number(price) * 1;

        // Update item với tất cả các field
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { 
                name,
                description,
                category,
                price, 
                rating,
                hearts,
                quantity,
                imageUrl,  // Giữ ảnh cũ hoặc dùng ảnh mới
                total
            },
            { new: true }
        );

        res.json(updatedItem);
    } catch (err) {
        next(err);
    }
};

// Update nhanh chỉ price và quantity (không động đến ảnh)
export const quickUpdateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, quantity } = req.body;

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { 
                price: Number(price),
                quantity: Number(quantity)
            },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.json(updatedItem);
    } catch (err) {
        next(err);
    }
};