import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import Role from '../../roles/models/role.model.js';
import Auth_User from '../models/auth_user.model.js';
import User from '../../users/models/user.model.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = await registerSchema.parseAsync(req.body);
    // Check email tồn tại
    const existing = await Auth_User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email đã tồn tại' });

    // Mặc định role là 'user'
    const role = await Role.findOne({ where: { name: 'user' } });
    if (!role) return res.status(500).json({ message: 'Role mặc định không tồn tại' });

    const hash = await bcrypt.hash(password, saltRounds);
    const authUser = await Auth_User.create({ email, password: hash, roleId: role.id });

    await User.create({
      firstName,
      lastName,
      authUserId: authUser.id
    });

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    const authUser = await Auth_User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['name'] }]
    });
    if (!authUser) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const match = await bcrypt.compare(password, authUser.password);
    if (!match) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    // Gán role name vào JWT
    const token = jwt.sign(
      { authUserId: authUser.id, role: authUser.role.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      maxAge: 3600000,
    });
    res.status(200).json({ message: 'Đăng nhập thành công', token });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const authUser = await Auth_User.findOne({ where: { email } });
    if (!authUser) {
      // Không tiết lộ email tồn tại hay không
      return res.status(200).json({ message: 'Nếu email tồn tại, hướng dẫn đã được gửi.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1h

    authUser.resetToken = resetToken;
    authUser.resetTokenExpiry = resetTokenExpiry;
    await authUser.save();

    const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'Nếu email tồn tại, hướng dẫn đã được gửi.' });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi yêu cầu đặt lại mật khẩu' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const authUser = await Auth_User.findOne({ where: { resetToken: token } });
    if (!authUser || !authUser.resetTokenExpiry || authUser.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    authUser.password = await bcrypt.hash(newPassword, saltRounds);
    authUser.resetToken = null;
    authUser.resetTokenExpiry = null;
    await authUser.save();

    res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi đặt lại mật khẩu' });
  }
};