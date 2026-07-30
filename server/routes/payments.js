const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get payments with filter options (Public)
router.get('/', async (req, res) => {
  try {
    const { bill, resident, status } = req.query;
    let filter = {};
    if (bill) filter.bill = bill;
    if (resident) filter.resident = resident;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate({
        path: 'bill',
        populate: { path: 'meter', select: 'name' }
      })
      .populate('resident', 'name roomNumber status phone')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server Error fetching payments' });
  }
});

// @route   GET /api/payments/resident/:residentId
// @desc    Get payment ledger for a specific resident (Public)
router.get('/resident/:residentId', async (req, res) => {
  try {
    const payments = await Payment.find({ resident: req.params.residentId })
      .populate({
        path: 'bill',
        populate: { path: 'meter', select: 'name' }
      })
      .populate('resident', 'name roomNumber')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server Error fetching resident payment history' });
  }
});

// @route   PATCH /api/payments/:id/status
// @desc    Update payment status (Owner only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, paymentMethod, notes } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (status) {
      payment.status = status;
      if (status === 'Paid') {
        payment.paidAt = new Date();
      } else {
        payment.paidAt = null;
      }
    }

    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (notes !== undefined) payment.notes = notes;

    const updatedPayment = await payment.save();
    const populated = await Payment.findById(updatedPayment._id)
      .populate({
        path: 'bill',
        populate: { path: 'meter', select: 'name' }
      })
      .populate('resident', 'name roomNumber status');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server Error updating payment status' });
  }
});

module.exports = router;
