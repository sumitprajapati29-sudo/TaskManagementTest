const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed.')
];

// @GET /api/tasks/stats
router.get('/stats', getTaskStats);

// @GET /api/tasks
router.get('/', getAllTasks);

// @GET /api/tasks/:id
router.get('/:id', getTaskById);

// @POST /api/tasks
router.post('/', taskValidation, createTask);

// @PUT /api/tasks/:id
router.put('/:id', updateTaskValidation, updateTask);

// @DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

module.exports = router;
