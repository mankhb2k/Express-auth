import express from 'express';
import { getAllUser, updateAuthUserRole } from '../controllers/user.controller.js';
import { authenticateToken, authorizeRole } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('admin'), getAllUser);
// Nâng/hạ role cho Auth_User (id là id của Auth_User)
router.patch('/auth-users/:id/role', authenticateToken, authorizeRole('admin'), updateAuthUserRole);

export default router;
