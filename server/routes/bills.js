const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Meter = require('../models/Meter');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/bills
// @desc    Get all bills (Public)
router.get('/', async (req, res) => {
  try {
    const { month, year, meter } = req.query;
    let query = {};
    if (month) query.month = month;
    if (year) query.year = Number(year);
    if (meter) query.meter = meter;

    const bills = await Bill.find(query)
      .populate('meter', 'name linkedRooms')
      .populate('residents', 'name roomNumber status')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ message: 'Server Error fetching bills' });
  }
});

// @route   GET /api/bills/:id
// @desc    Get bill details with payments
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('meter')
      .populate('residents');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const payments = await Payment.find({ bill: bill._id }).populate('resident');
    res.json({ bill, payments });
  } catch (err) {
    res.status(500).json({ message: 'Server Error fetching bill details' });
  }
});

// @route   POST /api/bills
// @desc    Create new monthly bill (Owner only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      meterId,
      previousReading,
      currentReading,
      totalAmount,
      month,
      year,
      residentIds,
      notes
    } = req.body;

    if (!meterId || previousReading === undefined || currentReading === undefined || !totalAmount || !month || !year || !residentIds || !residentIds.length) {
      return res.status(400).json({ message: 'Please provide all required fields including meter, readings, total amount, month, year, and at least one resident.' });
    }

    const prev = Number(previousReading);
    const curr = Number(currentReading);
    const tot = Number(totalAmount);

    if (curr < prev) {
      return res.status(400).json({ message: 'Current reading cannot be less than previous reading.' });
    }

    const unitsConsumed = curr - prev;
    const perHeadAmount = Math.round((tot / residentIds.length) * 100) / 100;

    const newBill = new Bill({
      meter: meterId,
      previousReading: prev,
      currentReading: curr,
      unitsConsumed,
      totalAmount: tot,
      month,
      year: Number(year),
      residents: residentIds,
      perHeadAmount,
      notes: notes || ''
    });

    const savedBill = await newBill.save();

    // Update meter last reading
    await Meter.findByIdAndUpdate(meterId, { lastReading: curr });

    // Generate Payment records for each resident
    const paymentPromises = residentIds.map(residentId => {
      return new Payment({
        bill: savedBill._id,
        resident: residentId,
        amount: perHeadAmount,
        status: 'Pending'
      }).save();
    });

    const payments = await Promise.all(paymentPromises);

    const populatedBill = await Bill.findById(savedBill._id)
      .populate('meter')
      .populate('residents');

    res.status(201).json({
      bill: populatedBill,
      payments
    });
  } catch (err) {
    console.error('Error creating bill:', err);
    res.status(500).json({ message: 'Server Error creating bill' });
  }
});

// @route   DELETE /api/bills/:id
// @desc    Delete a bill and associated payments (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    await Payment.deleteMany({ bill: bill._id });
    await Bill.findByIdAndDelete(bill._id);

    res.json({ message: 'Bill and associated payments deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error deleting bill' });
  }
});

module.exports = router;
