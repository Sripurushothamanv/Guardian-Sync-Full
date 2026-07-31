const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SleepLog = require('../models/SleepLog');
const CaffeineLog = require('../models/CaffeineLog');
const ShiftLog = require('../models/ShiftLog');
const NutritionLog = require('../models/NutritionLog');

// Helper to calculate recovery score (0-100)
function calculateRecoveryScore(duration, quality, wakeUps) {
  let base = 50;
  // duration factor: 8 hours is optimal
  const durDiff = Math.abs(8 - duration);
  if (durDiff < 1) base += 25;
  else if (durDiff < 2) base += 15;
  else if (durDiff < 3) base += 5;
  else base -= 10;

  // quality factor
  if (quality === 'Excellent') base += 25;
  else if (quality === 'Good') base += 15;
  else if (quality === 'Fair') base += 5;
  else base -= 15; // Poor

  // wakeups factor
  base -= (wakeUps * 5);

  return Math.min(100, Math.max(0, Math.round(base)));
}

// ==========================================
// SLEEP LOGS ROUTES
// ==========================================

// @route   POST api/logs/sleep
// @desc    Log a sleep session
router.post('/sleep', auth, async (req, res) => {
  try {
    const { startTime, endTime, quality, wakeUps } = req.body;
    
    // Parse Dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const duration = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

    const recoveryScore = calculateRecoveryScore(duration, quality, wakeUps || 0);

    const log = new SleepLog({
      userId: req.user._id,
      startTime: start,
      endTime: end,
      duration,
      quality,
      wakeUps: wakeUps || 0,
      recoveryScore
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error saving sleep log', error: error.message });
  }
});

// @route   GET api/logs/sleep
// @desc    Get sleep logs for the user
router.get('/sleep', auth, async (req, res) => {
  try {
    const logs = await SleepLog.find({ userId: req.user._id })
      .sort({ startTime: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sleep logs', error: error.message });
  }
});

// ==========================================
// CAFFEINE LOGS ROUTES
// ==========================================

// @route   POST api/logs/caffeine
// @desc    Log caffeine intake
router.post('/caffeine', auth, async (req, res) => {
  try {
    const { beverage, mgAmount, timestamp } = req.body;

    const log = new CaffeineLog({
      userId: req.user._id,
      beverage: beverage || 'Filter Coffee',
      mgAmount: mgAmount !== undefined ? mgAmount : 95,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error saving caffeine log', error: error.message });
  }
});

// @route   GET api/logs/caffeine
// @desc    Get caffeine logs for the user
router.get('/caffeine', auth, async (req, res) => {
  try {
    const logs = await CaffeineLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving caffeine logs', error: error.message });
  }
});

// ==========================================
// SHIFT LOGS ROUTES
// ==========================================

// @route   POST api/logs/shift
// @desc    Log a shift
router.post('/shift', auth, async (req, res) => {
  try {
    const { startTime, endTime, shiftType, breakDuration, notes } = req.body;

    const log = new ShiftLog({
      userId: req.user._id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      shiftType,
      breakDuration: breakDuration || 0,
      notes: notes || ''
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error saving shift log', error: error.message });
  }
});

// @route   GET api/logs/shift
// @desc    Get shift logs for the user
router.get('/shift', auth, async (req, res) => {
  try {
    const logs = await ShiftLog.find({ userId: req.user._id })
      .sort({ startTime: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shift logs', error: error.message });
  }
});

// ==========================================
// NUTRITION LOGS ROUTES
// ==========================================

// @route   POST api/logs/nutrition
// @desc    Log food consumption
router.post('/nutrition', auth, async (req, res) => {
  try {
    const { mealCategory, foodItem, calories, protein, carbs, fats, fiber, sodium, timestamp } = req.body;

    const log = new NutritionLog({
      userId: req.user._id,
      mealCategory: mealCategory || 'Breakfast',
      foodItem,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      fiber: fiber || 0,
      sodium: sodium || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error saving nutrition log', error: error.message });
  }
});

// @route   GET api/logs/nutrition
// @desc    Get nutrition logs for the user
router.get('/nutrition', auth, async (req, res) => {
  try {
    const logs = await NutritionLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving nutrition logs', error: error.message });
  }
});

module.exports = router;
