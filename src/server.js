require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

// Conectar ao banco de dados
connectDB();

// Criar app Express
const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Middleware para logging (opcional, mas útil)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/', enrollmentRoutes); // Rotas de enrollment começam com /courses ou /me

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API REST - Plataforma de Cursos',
    version: '1.0.0',
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

