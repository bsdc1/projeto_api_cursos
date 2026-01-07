const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Lista cursos com paginação e filtros
exports.getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const filter = {};
    
    // Se não for admin, só mostra cursos published
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published';
    } else {
      // Admin pode filtrar por status
      if (req.query.status) {
        filter.status = req.query.status;
      }
    }

    // Filtro por categoria
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Ordenação
    let sort = {};
    if (req.query.sort) {
      if (req.query.sort.startsWith('-')) {
        sort[req.query.sort.substring(1)] = -1;
      } else {
        sort[req.query.sort] = 1;
      }
    } else {
      sort.createdAt = -1; // Padrão: mais recentes primeiro
    }

    // Busca cursos
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Conta total
    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
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

// Busca curso por ID
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      });
    }

    // Se não for admin e curso estiver em draft, não mostra
    if (course.status === 'draft' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      });
    }

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

// Cria novo curso (apenas admin)
exports.createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors.array(),
      });
    }

    const { title, description, category, status, instructor, price } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      status: status || 'draft',
      instructor: instructor || null,
      price,
    });

    await course.populate('instructor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

// Atualiza curso (apenas admin)
exports.updateCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: errors.array(),
      });
    }

    const { title, description, category, status, instructor, price } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      });
    }

    // Atualiza apenas os campos fornecidos
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (status !== undefined) course.status = status;
    if (instructor !== undefined) course.instructor = instructor;
    if (price !== undefined) course.price = price;

    await course.save();
    await course.populate('instructor', 'name email');

    res.json({
      success: true,
      message: 'Curso atualizado com sucesso',
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

// Deleta curso (apenas admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado',
      });
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Curso deletado com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

