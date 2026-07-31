const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiParser = require('../services/aiParser');
const SleepLog = require('../models/SleepLog');
const CaffeineLog = require('../models/CaffeineLog');
const ShiftLog = require('../models/ShiftLog');
const NutritionLog = require('../models/NutritionLog');

// Helper to calculate recovery score (duplicated for convenience or imported)
function calculateRecoveryScore(duration, quality, wakeUps) {
  let base = 50;
  const durDiff = Math.abs(8 - duration);
  if (durDiff < 1) base += 25;
  else if (durDiff < 2) base += 15;
  else if (durDiff < 3) base += 5;
  else base -= 10;

  if (quality === 'Excellent') base += 25;
  else if (quality === 'Good') base += 15;
  else if (quality === 'Fair') base += 5;
  else base -= 15;

  base -= (wakeUps * 5);
  return Math.min(100, Math.max(0, Math.round(base)));
}

// @route   POST api/ai/parse
// @desc    Parse text string to extract metrics
// @access  Private
router.post('/parse', auth, (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Input text is required' });
    }

    const extractedData = aiParser.parseWellnessText(text);
    res.json(extractedData);
  } catch (error) {
    res.status(500).json({ message: 'Error parsing text input', error: error.message });
  }
});

// @route   POST api/ai/confirm
// @desc    Confirm extraction results and save to databases
// @access  Private
router.post('/confirm', auth, async (req, res) => {
  try {
    const { sleep, caffeine, shift, nutrition } = req.body;
    const userId = req.user._id;
    const savedItems = {
      sleep: null,
      caffeine: null,
      shift: null,
      nutrition: []
    };

    // 1. Save Sleep Log
    if (sleep && sleep.duration > 0) {
      const start = new Date();
      // Back-calculate startTime based on duration and current time
      const startTime = new Date(start.getTime() - sleep.duration * 60 * 60 * 1000);
      const recoveryScore = calculateRecoveryScore(sleep.duration, sleep.quality || 'Good', sleep.wakeUps || 0);

      const sleepLog = new SleepLog({
        userId,
        startTime,
        endTime: start,
        duration: sleep.duration,
        quality: sleep.quality || 'Good',
        wakeUps: sleep.wakeUps || 0,
        recoveryScore
      });
      await sleepLog.save();
      savedItems.sleep = sleepLog;
    }

    // 2. Save Caffeine Log
    if (caffeine && caffeine.count > 0) {
      // Create caffeine logs matching the count
      const log = new CaffeineLog({
        userId,
        beverage: caffeine.beverage || 'Filter Coffee',
        mgAmount: caffeine.mgAmount,
        timestamp: new Date()
      });
      await log.save();
      savedItems.caffeine = log;
    }

    // 3. Save Shift Log
    if (shift && shift.duration > 0) {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - shift.duration * 60 * 60 * 1000);

      const shiftLog = new ShiftLog({
        userId,
        startTime,
        endTime,
        shiftType: shift.shiftType || 'Day',
        breakDuration: shift.breakDuration || 0,
        notes: 'Logged via AI Voice/Chat Assistant'
      });
      await shiftLog.save();
      savedItems.shift = shiftLog;
    }

    // 4. Save Nutrition Logs
    if (nutrition && nutrition.length > 0) {
      for (const item of nutrition) {
        const nutrLog = new NutritionLog({
          userId,
          mealCategory: item.mealCategory || 'Breakfast',
          foodItem: item.foodItem,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fats: item.fats || 0,
          fiber: item.fiber || 0,
          sodium: item.sodium || 0,
          timestamp: new Date()
        });
        await nutrLog.save();
        savedItems.nutrition.push(nutrLog);
      }
    }

    res.status(201).json({
      message: 'Data confirmed and logged successfully!',
      savedItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming and logging data', error: error.message });
  }
});

module.exports = router;
