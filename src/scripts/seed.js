require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

// Script para criar um usuário admin inicial
async function seed() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Verifica se já existe admin
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin já existe:', adminEmail);
      process.exit(0);
    }

    // Cria admin
    const admin = await User.create({
      name: 'Administrador',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('\n⚠️  Lembre-se de alterar a senha após o primeiro login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    process.exit(1);
  }
}

seed();

