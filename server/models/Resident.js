const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roomNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Left'],
    default: 'Active'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Resident', residentSchema);
