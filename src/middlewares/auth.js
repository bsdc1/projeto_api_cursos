const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para autenticação
const authenticate = async (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação não fornecido' 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_secret_aqui');
    
    // Busca o usuário no banco
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Adiciona o usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Erro na autenticação' 
    });
  }
};

// Middleware para autorização (verificar role)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Permissão insuficiente.' 
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };

