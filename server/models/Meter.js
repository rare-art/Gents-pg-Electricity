const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  linkedRooms: [{
    type: Number
  }],
  lastReading: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Meter', meterSchema);
