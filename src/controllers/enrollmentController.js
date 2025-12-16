const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Matricula usuário em um curso
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Verifica se o curso existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      });
    }

    // Verifica se já está matriculado
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Você já está matriculado neste curso',
      });
    }

    // Cria matrícula
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'active',
    });

    await enrollment.populate('course', 'title description category status');
    await enrollment.populate('student', 'name email');

    res.status(201).json({
      success: true,
      message: 'Matrícula realizada com sucesso',
      data: { enrollment },
    });
  } catch (error) {
    next(error);
  }
};

// Lista matrículas do usuário autenticado
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Busca matrículas do usuário
    const enrollments = await Enrollment.find({ student: userId })
      .populate('course', 'title description category status instructor')
      .populate('student', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Conta total
    const total = await Enrollment.countDocuments({ student: userId });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancela/deleta matrícula
exports.deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Busca matrícula
    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Matrícula não encontrada',
      });
    }

    // Verifica se é o dono da matrícula ou admin
    if (enrollment.student.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para cancelar esta matrícula',
      });
    }

    await enrollment.deleteOne();

    res.json({
      success: true,
      message: 'Matrícula cancelada com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

