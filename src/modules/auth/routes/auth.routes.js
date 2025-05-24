import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Đây là route được bảo vệ, bạn đã đăng nhập bằng JWT!', userId: req.user.userId });
});

export default router;