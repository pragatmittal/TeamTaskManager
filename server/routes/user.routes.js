import { Router } from 'express';
import * as user from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/', user.listUsers);

export default router;
