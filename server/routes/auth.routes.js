import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { handleValidation } from '../utils/validation.js';

const router = Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'member'])
      .withMessage('Role must be admin or member'),
  ],
  handleValidation,
  auth.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  auth.login
);

router.get('/me', verifyToken, auth.me);

export default router;
