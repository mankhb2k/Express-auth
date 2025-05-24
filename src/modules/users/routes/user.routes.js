import express from 'express';
import { getAllUser } from '../controllers/user.controller.js';
import { authenticateToken } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAllUser);

export default router;