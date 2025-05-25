import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/auth_user.model.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { Op } from 'sequelize';
import crypto from 'crypto'; // Import module crypto để tạo token ngẫu nhiên
import { sendPasswordResetEmail } from '../services/email.service.js'; // Import hàm gửi email

dotenv.config(); // Tải biến môi trường từ .env
const saltRounds = 10; // Số vòng băm cho bcrypt
const JWT_SECRET = process.env.JWT_SECRET; // Lấy JWT_SECRET từ biến môi trường

// Register
export const register = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào bằng Zod
    const { email, password } = await registerSchema.parse(req.body);

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    // Băm mật khẩu trước khi lưu vào database
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Tạo người dùng mới trong database
    const newUser = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    // Xử lý lỗi validation từ Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    // Log lỗi chi tiết và trả về lỗi server
    console.error('Lỗi đăng ký:', error.message, error.stack);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào bằng Zod
    const { email, password } = await loginSchema.parse(req.body);

    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // So sánh mật khẩu đã nhập với mật khẩu đã băm trong database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Đặt JWT token vào cookie
    res.cookie('token', token, {
      httpOnly: true, // Cookie chỉ có thể truy cập bởi server
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // Chỉ gửi qua HTTPS trong production
      maxAge: 3600000, // Thời gian sống của cookie (1 giờ)
    });
    res.status(200).json({ message: 'Đăng nhập thành công', token }); // Tùy chọn: trả về token trong response
  } catch (error) {
    // Xử lý lỗi validation từ Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    // Log lỗi chi tiết và trả về lỗi server
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

// Logout
export const logout = (req, res) => {
  // Xóa cookie chứa token
  res.clearCookie('token');
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

// Gửi Reset Password
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body; // Lấy email từ request body

    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Trả về thông báo chung để tránh tiết lộ thông tin người dùng
      return res.status(404).json({ message: 'Nếu email của bạn tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến.' });
    }

    // Tạo một token duy nhất (20 bytes hex string)
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Đặt thời gian hết hạn cho token (ví dụ: 1 giờ sau)
    const resetTokenExpiry = Date.now() + 3600000;

    // Lưu token và thời gian hết hạn vào database
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Tạo đường link đặt lại mật khẩu đầy đủ
    // req.protocol: 'http' hoặc 'https'
    // req.get('host'): 'localhost:3000' hoặc domain của bạn
    const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

    // Gửi email cho người dùng chứa liên kết đặt lại mật khẩu
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'Nếu email của bạn tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến.' });
  } catch (error) {
    console.error('Lỗi yêu cầu đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi yêu cầu đặt lại mật khẩu' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body; // Lấy token và mật khẩu mới từ request body

    // Tìm người dùng dựa trên resetToken
    const user = await User.findOne({ where: { resetToken: token } });

    // Kiểm tra xem token có tồn tại không
    if (!user) {
      return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.' });
    }

    // Kiểm tra thời gian hết hạn của token
    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Token đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu một token mới.' });
    }

    // Băm mật khẩu mới trước khi lưu
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword; // Cập nhật mật khẩu mới
    user.resetToken = null; // Xóa token sau khi sử dụng
    user.resetTokenExpiry = null; // Xóa thời gian hết hạn
    await user.save(); // Lưu các thay đổi vào database

    res.status(200).json({ message: 'Mật khẩu của bạn đã được đặt lại thành công.' });
  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu' });
  }
};
