const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middlewares/auth');

// Validações para criar/atualizar curso
const courseValidation = [
  body('title').trim().notEmpty().withMessage('Título é obrigatório'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('category').trim().notEmpty().withMessage('Categoria é obrigatória'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status inválido'),
];

// GET /courses (público)
router.get('/', courseController.getCourses);

// GET /courses/:id (público)
router.get('/:id', courseController.getCourseById);

// POST /courses (apenas admin)
router.post('/', authenticate, authorize('admin'), courseValidation, courseController.createCourse);

// PATCH /courses/:id (apenas admin)
router.patch('/:id', authenticate, authorize('admin'), courseValidation, courseController.updateCourse);

// DELETE /courses/:id (apenas admin)
router.delete('/:id', authenticate, authorize('admin'), courseController.deleteCourse);

module.exports = router;

