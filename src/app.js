import express from 'express';
import sequelize from './config/database.js';
import authRoutes from './modules/auth/routes/auth.routes.js';
import userRoutes from './modules/users/routes/user.routes.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config(); // Load biến môi trường từ .env

const app = express();

// Middleware
app.use(express.json()); // Xử lý JSON trong request body
app.use(cookieParser()); // Xử lý cookie
app.use(morgan('dev'));   // Log request (development)

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes); // **ROUTE CHÍNH XÁC**

// Kết nối đến database và đồng bộ hóa model
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return sequelize.sync();
  })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Unable to connect to the database:', err));

export default app;