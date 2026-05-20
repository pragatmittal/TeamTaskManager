import { Router } from 'express';
import { body, param } from 'express-validator';
import * as project from '../controllers/project.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { handleValidation } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  requireAdmin,
  [body('title').trim().notEmpty().withMessage('Title is required')],
  handleValidation,
  project.createProject
);

router.get('/', project.getProjects);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid project id')], handleValidation, project.getProjectById);

router.patch(
  '/:id',
  requireAdmin,
  [param('id').isMongoId().withMessage('Invalid project id')],
  handleValidation,
  project.updateProject
);

router.delete(
  '/:id',
  requireAdmin,
  [param('id').isMongoId().withMessage('Invalid project id')],
  handleValidation,
  project.deleteProject
);

router.post(
  '/:id/members',
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid project id'),
    body('userId').isMongoId().withMessage('Valid userId is required'),
  ],
  handleValidation,
  project.addMember
);

router.delete(
  '/:id/members/:userId',
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid project id'),
    param('userId').isMongoId().withMessage('Invalid user id'),
  ],
  handleValidation,
  project.removeMember
);

export default router;
