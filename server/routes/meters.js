const express = require('express');
const router = express.Router();
const Meter = require('../models/Meter');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/meters
// @desc    Get all meters (Public)
router.get('/', async (req, res) => {
  try {
    const meters = await Meter.find().sort({ createdAt: 1 });
    res.json(meters);
  } catch (err) {
    res.status(500).json({ message: 'Server Error fetching meters' });
  }
});

// @route   POST /api/meters
// @desc    Add a meter (Owner only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, linkedRooms, lastReading, notes } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Meter name is required' });
    }

    const newMeter = new Meter({
      name,
      linkedRooms: linkedRooms || [],
      lastReading: lastReading || 0,
      notes: notes || ''
    });

    const savedMeter = await newMeter.save();
    res.status(201).json(savedMeter);
  } catch (err) {
    res.status(500).json({ message: 'Server Error adding meter' });
  }
});

// @route   PUT /api/meters/:id
// @desc    Update a meter (Owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, linkedRooms, lastReading, notes } = req.body;
    const meter = await Meter.findById(req.params.id);
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    if (name) meter.name = name;
    if (linkedRooms !== undefined) meter.linkedRooms = linkedRooms;
    if (lastReading !== undefined) meter.lastReading = lastReading;
    if (notes !== undefined) meter.notes = notes;

    const updatedMeter = await meter.save();
    res.json(updatedMeter);
  } catch (err) {
    res.status(500).json({ message: 'Server Error updating meter' });
  }
});

// @route   DELETE /api/meters/:id
// @desc    Delete a meter (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const meter = await Meter.findByIdAndDelete(req.params.id);
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }
    res.json({ message: 'Meter removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error deleting meter' });
  }
});

module.exports = router;
