const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Estudante é obrigatório'],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Curso é obrigatório'],
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  originalPrice: {
    type: Number,
    required: [true, 'Preço original é obrigatório'],
    min: [0, 'Preço não pode ser negativo'],
    // Preço original em centavos (ex: 9990 = R$ 99,90)
  },
  pricePaid: {
    type: Number,
    required: [true, 'Preço pago é obrigatório'],
    min: [0, 'Preço não pode ser negativo'],
    // Preço pago em centavos (ex: 6993 = R$ 69,93)
  },
  discountApplied: {
    type: Boolean,
    default: false,
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Índice único para evitar matrículas duplicadas
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

