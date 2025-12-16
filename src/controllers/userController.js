const User = require('../models/User');

// Lista todos os usuários (apenas admin)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtro por role (opcional)
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Busca usuários
    const users = await User.find(filter)
      .select('-password') // Remove senha
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Conta total de usuários
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
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

