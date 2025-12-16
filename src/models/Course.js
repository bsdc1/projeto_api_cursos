const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', courseSchema);

