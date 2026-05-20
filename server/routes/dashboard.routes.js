import { Router } from 'express';
import * as dashboard from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', dashboard.getDashboard);

export default router;
