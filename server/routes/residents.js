const express = require('express');
const router = express.Router();
const Resident = require('../models/Resident');
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/residents
// @desc    Get all residents (Public)
router.get('/', async (req, res) => {
  try {
    const residents = await Resident.find().sort({ roomNumber: 1, name: 1 });
    res.json(residents);
  } catch (err) {
    res.status(500).json({ message: 'Server Error fetching residents' });
  }
});

// @route   POST /api/residents
// @desc    Add a resident (Owner only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, roomNumber, phone, status } = req.body;
    if (!name || !roomNumber) {
      return res.status(400).json({ message: 'Name and Room Number are required' });
    }

    const newResident = new Resident({
      name,
      roomNumber,
      phone: phone || '',
      status: status || 'Active'
    });

    const savedResident = await newResident.save();
    res.status(201).json(savedResident);
  } catch (err) {
    res.status(500).json({ message: 'Server Error adding resident' });
  }
});

// @route   PUT /api/residents/:id
// @desc    Update a resident (Owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, roomNumber, phone, status } = req.body;
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    if (name) resident.name = name;
    if (roomNumber) resident.roomNumber = roomNumber;
    if (phone !== undefined) resident.phone = phone;
    if (status) resident.status = status;

    const updatedResident = await resident.save();
    res.json(updatedResident);
  } catch (err) {
    res.status(500).json({ message: 'Server Error updating resident' });
  }
});

// @route   DELETE /api/residents/:id
// @desc    Delete a resident (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resident = await Resident.findByIdAndDelete(req.params.id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    // Clean up payments associated with this deleted resident
    await Payment.deleteMany({ resident: req.params.id });

    res.json({ message: 'Resident removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error deleting resident' });
  }
});

module.exports = router;
