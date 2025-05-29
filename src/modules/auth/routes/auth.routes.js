import express from 'express';
import { register, login, logout, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// QUÊN MẬT KHẨU + ĐẶT LẠI MẬT KHẨU
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Bạn đã đăng nhập bằng JWT!', authUserId: req.user.authUserId, role: req.user.role });
});

export default router;
