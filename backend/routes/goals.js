const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Goal = require('../models/Goal');
const SleepLog = require('../models/SleepLog');
const CaffeineLog = require('../models/CaffeineLog');
const ShiftLog = require('../models/ShiftLog');
const NutritionLog = require('../models/NutritionLog');

// Get today's date formatted as YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// @route   GET api/goals
// @desc    Get daily wellness goals (auto-creates default 5 if none exist)
router.get('/', auth, async (req, res) => {
  try {
    const today = getTodayString();
    let goals = await Goal.find({ userId: req.user._id, date: today });

    if (goals.length === 0) {
      // Auto-create 5 default daily wellness goals based on user profile settings
      const defaultGoals = [
        {
          title: `Sleep Duration >= ${req.user.sleepGoal} hrs`,
          type: 'sleep',
          targetValue: req.user.sleepGoal,
          currentValue: 0
        },
        {
          title: `Caffeine Intake <= ${req.user.caffeineLimit} mg`,
          type: 'caffeine',
          targetValue: req.user.caffeineLimit,
          currentValue: 0
        },
        {
          title: `Hydration Intake >= ${req.user.waterGoal} ml`,
          type: 'water',
          targetValue: req.user.waterGoal,
          currentValue: 0
        },
        {
          title: 'Shift Break Duration >= 30 mins',
          type: 'shift_limit',
          targetValue: 30,
          currentValue: 0
        },
        {
          title: 'Total Calorie Intake <= 2500 kcal',
          type: 'nutrition',
          targetValue: 2500,
          currentValue: 0
        }
      ];

      const goalsToSave = defaultGoals.map(g => ({
        ...g,
        userId: req.user._id,
        date: today,
        completed: g.type === 'caffeine' // Caffeine starts at 0 mg, which is <= limit, so initially true
      }));

      goals = await Goal.insertMany(goalsToSave);
    }

    // Recalculate current values based on today's logs before returning
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    // Fetch logs of today
    const sleepLogs = await SleepLog.find({ userId: req.user._id, createdAt: { $gte: startOfToday, $lte: endOfToday } });
    const caffeineLogs = await CaffeineLog.find({ userId: req.user._id, timestamp: { $gte: startOfToday, $lte: endOfToday } });
    const shiftLogs = await ShiftLog.find({ userId: req.user._id, createdAt: { $gte: startOfToday, $lte: endOfToday } });
    const nutritionLogs = await NutritionLog.find({ userId: req.user._id, timestamp: { $gte: startOfToday, $lte: endOfToday } });

    // Summing today's counts
    const todaySleep = sleepLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const todayCaffeine = caffeineLogs.reduce((sum, log) => sum + (log.mgAmount || 0), 0);
    const todayWater = nutritionLogs.filter(n => n.foodItem.toLowerCase().includes('water')).reduce((sum, n) => sum + (n.calories || 250), 0); // fallback water mock
    const todayShiftBreak = shiftLogs.reduce((sum, log) => sum + (log.breakDuration || 0), 0);
    const todayCalories = nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

    for (let goal of goals) {
      if (goal.type === 'sleep') {
        goal.currentValue = todaySleep;
        goal.completed = goal.currentValue >= goal.targetValue;
      } else if (goal.type === 'caffeine') {
        goal.currentValue = todayCaffeine;
        goal.completed = goal.currentValue <= goal.targetValue;
      } else if (goal.type === 'water') {
        // Mock hydration: fetch water logged or default to a slider value
        // Let's use nutrition logged water.
        goal.currentValue = todayWater;
        goal.completed = goal.currentValue >= goal.targetValue;
      } else if (goal.type === 'shift_limit') {
        goal.currentValue = todayShiftBreak;
        goal.completed = goal.currentValue >= goal.targetValue;
      } else if (goal.type === 'nutrition') {
        goal.currentValue = todayCalories;
        // completed if calories logged are > 0 and <= target
        goal.completed = goal.currentValue > 0 && goal.currentValue <= goal.targetValue;
      }
      await goal.save();
    }

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving goals', error: error.message });
  }
});

// @route   PUT api/goals/:id
// @desc    Manually update goal progress
router.put('/:id', auth, async (req, res) => {
  try {
    const { currentValue, completed } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (currentValue !== undefined) goal.currentValue = currentValue;
    if (completed !== undefined) goal.completed = completed;
    
    // Auto-update completed flag if based on numerical targets
    if (goal.type !== 'caffeine' && goal.type !== 'nutrition') {
      goal.completed = goal.currentValue >= goal.targetValue;
    } else if (goal.type === 'caffeine') {
      goal.completed = goal.currentValue <= goal.targetValue;
    } else if (goal.type === 'nutrition') {
      goal.completed = goal.currentValue > 0 && goal.currentValue <= goal.targetValue;
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
});

// @route   GET api/goals/streak
// @desc    Retrieve user's goal streak and unlocked badges
router.get('/streak', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Streaks logic: count consecutive days backwards from yesterday where at least one goal was completed
    let streakCount = 0;
    const today = new Date();
    
    // We scan back 30 days
    for (let i = 0; i < 30; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];

      const completedCount = await Goal.countDocuments({
        userId,
        date: dateStr,
        completed: true
      });

      if (completedCount > 0) {
        streakCount++;
      } else {
        // Break the streak check only if we are past today and there are no completed goals
        if (i > 0) break;
      }
    }

    // Fetch logs to dynamically reward badges
    const sleepCount = await SleepLog.countDocuments({ userId });
    const shiftCount = await ShiftLog.countDocuments({ userId });
    const nightShiftCount = await ShiftLog.countDocuments({ userId, shiftType: 'Night' });
    const caffeineCount = await CaffeineLog.countDocuments({ userId });

    const badges = [];

    // Badge 1: Registration / Starter
    badges.push({
      id: 'badge_starter',
      title: 'First Step',
      description: 'Joined Guardian-Sync and started tracking wellness.',
      icon: '🌱',
      unlocked: true
    });

    // Badge 2: Sleep Badge
    badges.push({
      id: 'badge_sleep',
      title: 'Sleep Champion',
      description: 'Logged sleep 3+ times to manage sleep debt.',
      icon: '😴',
      unlocked: sleepCount >= 3
    });

    // Badge 3: Night Shift Survivor
    badges.push({
      id: 'badge_shift',
      title: 'Night Shift Survivor',
      description: 'Completed 3+ overnight shifts.',
      icon: '🦇',
      unlocked: nightShiftCount >= 3
    });

    // Badge 4: Streak Badge
    badges.push({
      id: 'badge_streak_7',
      title: '7-Day Streak Warrior',
      description: 'Completed wellness goals 7 consecutive days.',
      icon: '🔥',
      unlocked: streakCount >= 7
    });

    // Badge 5: Caffeine Commander
    badges.push({
      id: 'badge_caffeine',
      title: 'Caffeine Commander',
      description: 'Logged caffeine intake 5+ times.',
      icon: '☕',
      unlocked: caffeineCount >= 5
    });

    res.json({
      streakCount,
      badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving streaks', error: error.message });
  }
});

module.exports = router;
