const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'PG Owner'
  },
  role: {
    type: String,
    enum: ['owner'],
    default: 'owner'
  },
  resetOtp: {
    type: String,
    default: null
  },
  resetOtpExpiry: {
    type: Date,
    default: null
  },
  loginOtp: {
    type: String,
    default: null
  },
  loginOtpExpiry: {
    type: Date,
    default: null
  },
  lastOtpSentAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
