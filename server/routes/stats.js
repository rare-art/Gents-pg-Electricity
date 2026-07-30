const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Resident = require('../models/Resident');
const Meter = require('../models/Meter');

// @route   GET /api/stats/summary
// @desc    Get dashboard summary statistics (Public)
router.get('/summary', async (req, res) => {
  try {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    const currentMonthName = months[currentDate.getMonth()];
    const currentYearNum = currentDate.getFullYear();

    // Active residents count
    const activeResidentsCount = await Resident.countDocuments({ status: 'Active' });
    const totalResidentsCount = await Resident.countDocuments({});

    // Current month bills
    const currentMonthBills = await Bill.find({
      month: currentMonthName,
      year: currentYearNum
    }).sort({ createdAt: -1 });

    // Pending payments total
    const pendingPayments = await Payment.find({ status: 'Pending' });
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const paidPayments = await Payment.find({ status: 'Paid' });
    const totalPaidAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total bills metrics
    const allBills = await Bill.find({});
    const totalBillAmount = allBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalUnitsConsumed = allBills.reduce((sum, b) => sum + (b.unitsConsumed || 0), 0);

    // Meters count
    const metersCount = await Meter.countDocuments({});

    // Recent 5 bills
    const recentBills = await Bill.find({})
      .populate('meter', 'name')
      .populate('residents', 'name roomNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      activeResidentsCount,
      totalResidentsCount,
      totalPendingAmount,
      totalPaidAmount,
      totalBillAmount,
      totalUnitsConsumed,
      metersCount,
      currentMonth: currentMonthName,
      currentYear: currentYearNum,
      recentBills
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server Error fetching dashboard stats' });
  }
});

module.exports = router;
