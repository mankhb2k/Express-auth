import express from 'express';
import { register, login, logout, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Route đăng ký người dùng
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Route yêu cầu đặt lại mật khẩu
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Đây là route được bảo vệ, bạn đã đăng nhập bằng JWT!', userId: req.user.userId });
});

export default router;