import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as task from '../controllers/task.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { handleValidation } from '../utils/validation.js';

const router = Router();

router.use(verifyToken);

const statusValues = ['todo', 'in-progress', 'done'];
const priorityValues = ['low', 'medium', 'high'];

router.post(
  '/',
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('project').isMongoId().withMessage('Valid project id is required'),
    body('description').optional().isString(),
    body('assignedTo').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid assignee'),
    body('priority').optional().isIn(priorityValues).withMessage('Invalid priority'),
    body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid due date'),
  ],
  handleValidation,
  task.createTask
);

router.get(
  '/',
  [
    query('project').optional().isMongoId().withMessage('Invalid project filter'),
    query('status').optional().isIn(statusValues).withMessage('Invalid status filter'),
    query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo filter'),
  ],
  handleValidation,
  task.getTasks
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid task id')], handleValidation, task.getTaskById);

router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task id')],
  handleValidation,
  task.updateTask
);

router.delete(
  '/:id',
  requireAdmin,
  [param('id').isMongoId().withMessage('Invalid task id')],
  handleValidation,
  task.deleteTask
);

export default router;
