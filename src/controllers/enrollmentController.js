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

    // Conta quantas matrículas pagas (ativas) o aluno já tem
    const existingEnrollmentsCount = await Enrollment.countDocuments({
      student: studentId,
      status: 'active',
      paymentStatus: 'paid',
    });

    // Calcula o preço original do curso (em centavos)
    const originalPrice = course.price;

    // Aplica desconto de 30% se o aluno já tem 3 ou mais matrículas (4º curso em diante)
    let pricePaid = originalPrice;
    let discountApplied = false;
    let discountPercentage = 0;

    if (existingEnrollmentsCount >= 3) {
      discountPercentage = 30;
      discountApplied = true;
      // Calcula desconto em centavos: multiplica por 0.7 (70% do valor) e arredonda
      pricePaid = Math.round(originalPrice * (1 - discountPercentage / 100));
    }

    // Cria matrícula com status 'pending' (aguardando pagamento)
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'pending',
      paymentStatus: 'pending',
      originalPrice,
      pricePaid,
      discountApplied,
      discountPercentage,
    });

    await enrollment.populate('course', 'title description category status price');
    await enrollment.populate('student', 'name email');

    res.status(201).json({
      success: true,
      message: 'Matrícula criada. Aguardando confirmação de pagamento.',
      data: { 
        enrollment,
        pricing: {
          originalPrice,
          pricePaid,
          discountApplied,
          discountPercentage: discountApplied ? discountPercentage : 0,
        },
        paymentStatus: 'pending',
        note: 'A matrícula será ativada após confirmação do pagamento',
      },
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
      .populate('course', 'title description category status instructor price')
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

// Confirma pagamento e ativa matrícula
exports.confirmPayment = async (req, res, next) => {
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
        message: 'Você não tem permissão para confirmar o pagamento desta matrícula',
      });
    }

    // Verifica se já está paga
    if (enrollment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Esta matrícula já foi paga',
      });
    }

    // Atualiza status de pagamento e ativa matrícula
    enrollment.paymentStatus = 'paid';
    enrollment.status = 'active';
    await enrollment.save();

    await enrollment.populate('course', 'title description category status price');
    await enrollment.populate('student', 'name email');

    res.json({
      success: true,
      message: 'Pagamento confirmado. Matrícula ativada com sucesso!',
      data: { enrollment },
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

    // Se já foi paga, apenas cancela (não deleta)
    if (enrollment.paymentStatus === 'paid') {
      enrollment.status = 'cancelled';
      enrollment.paymentStatus = 'refunded';
      await enrollment.save();
      
      return res.json({
        success: true,
        message: 'Matrícula cancelada. Reembolso processado.',
      });
    }

    // Se não foi paga, pode deletar
    await enrollment.deleteOne();

    res.json({
      success: true,
      message: 'Matrícula cancelada com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

