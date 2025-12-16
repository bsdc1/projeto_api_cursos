const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middlewares/auth');

// POST /courses/:courseId/enroll (apenas student)
router.post('/courses/:courseId/enroll', authenticate, authorize('student'), enrollmentController.enrollInCourse);

// GET /me/enrollments (autenticado)
router.get('/me/enrollments', authenticate, enrollmentController.getMyEnrollments);

// DELETE /enrollments/:id (autenticado - próprio aluno ou admin)
router.delete('/enrollments/:id', authenticate, enrollmentController.deleteEnrollment);

module.exports = router;

