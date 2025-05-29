import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/routes/auth.routes.js';
import userRoutes from './modules/users/routes/user.routes.js';


dotenv.config(); // Load biến môi trường từ .env
const app = express();

// Middleware
app.use(express.json()); // Xử lý JSON trong request body
app.use(cookieParser()); // Xử lý cookie
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes); 

app.get('/', (req, res) => res.json({ message: 'API is running' }));

export default app;