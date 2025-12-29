import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js'

import path from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/userRoute.js'
import cartRouter from './routes/cartRoute.js'
import itemRouter from './routes/itemRoute.js';
import orderRouter from './routes/orderRoute.js';

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARE 
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
              "https://foodie-frenzy-frontend-eone.onrender.com",
              "https://foodie-frenzy-admin.onrender.com",
              "http://localhost:3000",
              "http://localhost:5173",
              "http://127.0.0.1:5173",
              "http://127.0.0.1:3000"
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB CONNECT
connectDB();
console.log("Stripe Key Loaded:", !!process.env.STRIPE_SECRET_KEY);


// Routes
app.use('/api/user', userRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/cart', cartRouter)
app.use('/api/items', itemRouter);
app.use('/api/orders', orderRouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
})

// ⚠️ TEMP ROUTE: Tạo admin user (DELETE sau khi tạo xong)
app.post('/api/create-admin', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        if (!email || !password || !username) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, password, và username bắt buộc' 
            });
        }

        const User = (await import('./modals/userModel.js')).default;
        
        // Check xem user đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User đã tồn tại' 
            });
        }

        // Hash password
        const bcrypt = (await import('bcryptjs')).default;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo admin user
        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin'  // ← Admin role
        });

        await adminUser.save();

        return res.status(201).json({ 
            success: true, 
            message: 'Admin user tạo thành công!',
            user: { 
                username: adminUser.username,
                email: adminUser.email,
                role: adminUser.role
            }
        });
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server: ' + err.message 
        });
    }
})

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
})