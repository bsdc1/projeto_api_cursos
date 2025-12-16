const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Validações para registro
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

// Validações para login
const loginValidation = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

// POST /auth/register
router.post('/register', registerValidation, authController.register);

// POST /auth/login
router.post('/login', loginValidation, authController.login);

// GET /auth/me
router.get('/me', authenticate, authController.getMe);

module.exports = router;

