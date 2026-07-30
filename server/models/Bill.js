const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  meter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meter',
    required: true
  },
  previousReading: {
    type: Number,
    required: true
  },
  currentReading: {
    type: Number,
    required: true
  },
  unitsConsumed: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true // e.g. "July", "August"
  },
  year: {
    type: Number,
    required: true // e.g. 2026
  },
  residents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident'
  }],
  perHeadAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
