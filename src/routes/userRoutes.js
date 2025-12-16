const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

// GET /users (apenas admin)
router.get('/', authenticate, authorize('admin'), userController.getUsers);

module.exports = router;

