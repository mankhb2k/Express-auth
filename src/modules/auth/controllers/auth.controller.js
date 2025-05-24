import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/auth_user.model.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { Op } from 'sequelize';

dotenv.config();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET; // Lấy từ .env

export const register = async (req, res) => {
  try {
    const { email, password } = await registerSchema.parse(req.body);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Lỗi đăng ký:', error.message, error.stack); // Thêm log chi tiết
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = await loginSchema.parse(req.body);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      maxAge: 3600000,
    });
    res.status(200).json({ message: 'Đăng nhập thành công', token }); // Tùy chọn: trả về token
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Đăng xuất thành công' });
};
