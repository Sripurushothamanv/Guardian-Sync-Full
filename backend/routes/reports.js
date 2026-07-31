const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SleepLog = require('../models/SleepLog');
const CaffeineLog = require('../models/CaffeineLog');
const ShiftLog = require('../models/ShiftLog');
const NutritionLog = require('../models/NutritionLog');
const Notification = require('../models/Notification');
const calculators = require('../services/calculators');

// Trigger helper to create notifications without duplicates
async function triggerNotification(userId, type, message) {
  const recent = await Notification.findOne({
    userId,
    type,
    message,
    createdAt: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) } // 4 hours threshold
  });
  if (!recent) {
    const notif = new Notification({ userId, type, message });
    await notif.save();
  }
}

// @route   GET api/reports/dashboard
// @desc    Retrieve real-time wellness dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentTime = new Date();

    // 1. Fetch relevant logs
    const startOf7Days = new Date(currentTime);
    startOf7Days.setDate(currentTime.getDate() - 7);

    const sleepLogs = await SleepLog.find({ userId, startTime: { $gte: startOf7Days } });
    const caffeineLogs = await CaffeineLog.find({ userId, timestamp: { $gte: startOf7Days } });
    const shiftLogs = await ShiftLog.find({ userId, startTime: { $gte: startOf7Days } });
    const nutritionLogs = await NutritionLog.find({ userId, timestamp: { $gte: startOf7Days } });

    // 2. Calculate metrics
    const fatigueScore = calculators.calculateFatigueScore({
      user: req.user,
      sleepLogs,
      caffeineLogs,
      shiftLogs,
      currentTime
    });

    // Determine Fatigue Level
    let fatigueLevel = 'Low';
    if (fatigueScore >= 80) fatigueLevel = 'Critical';
    else if (fatigueScore >= 60) fatigueLevel = 'High';
    else if (fatigueScore >= 40) fatigueLevel = 'Moderate';

    // Last night sleep duration
    let lastNightSleep = 8;
    let lastSleepQuality = 'Good';
    let recoveryScore = 75;
    let awakeHours = 12;
    if (sleepLogs.length > 0) {
      const sortedSleep = [...sleepLogs].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
      const latest = sortedSleep[0];
      lastNightSleep = latest.duration || 0;
      lastSleepQuality = latest.quality;
      recoveryScore = latest.recoveryScore || 75;
      
      const diffMs = currentTime - new Date(latest.endTime);
      if (diffMs >= 0) {
        awakeHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      }
    }

    // Active shift duration if currently working
    let activeShiftDuration = 0;
    const activeShift = shiftLogs.find(s => currentTime >= new Date(s.startTime) && currentTime <= new Date(s.endTime));
    if (activeShift) {
      const diffMs = currentTime - new Date(activeShift.startTime);
      activeShiftDuration = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    // 3. Evaluate Safe-to-Drive
    const driveSafety = calculators.evaluateDriveSafety({
      fatigueScore,
      lastNightSleep,
      hoursAwake: awakeHours,
      activeShiftDuration
    });

    // 4. Sleep Debt (target 8h per day)
    let sleepDebt = 0;
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(currentTime);
      dayStart.setDate(currentTime.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = sleepLogs.filter(log => {
        const end = new Date(log.endTime);
        return end >= dayStart && end < dayEnd;
      });
      const totalSlept = dayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      sleepDebt += Math.max(0, req.user.sleepGoal - totalSlept);
    }
    sleepDebt = parseFloat(sleepDebt.toFixed(1));

    // 5. Active Caffeine Level decaying in system
    let activeCaffeine = 0;
    caffeineLogs.forEach(log => {
      const t = (currentTime - new Date(log.timestamp)) / (1000 * 60 * 60);
      if (t >= 0 && t <= 24) {
        activeCaffeine += log.mgAmount * Math.exp(-0.1386 * t);
      }
    });
    activeCaffeine = Math.round(activeCaffeine);

    // 6. Water progress (based on logged water cups or item named "water" in nutrition)
    const todayStart = new Date(currentTime);
    todayStart.setHours(0, 0, 0, 0);
    const todayWaterLogs = nutritionLogs.filter(n => 
      new Date(n.timestamp) >= todayStart && 
      n.foodItem.toLowerCase().includes('water')
    );
    const waterIntake = todayWaterLogs.reduce((sum, n) => sum + (n.calories || 250), 0); // using calories field as ml fallback

    // 7. Auto-trigger Alerts based on metrics
    if (fatigueScore >= 80) {
      await triggerNotification(userId, 'burnout', `Critical warning: Your fatigue is extremely high (${fatigueScore}/100). Take immediate rest!`);
      await triggerNotification(userId, 'drive_warning', `Unsafe Drive Alert: Fatigue is critical. Please do NOT drive home.`);
    } else if (fatigueScore >= 60) {
      await triggerNotification(userId, 'drive_warning', `Mild Drive Alert: Fatigue is high (${fatigueScore}/100). Exercise caution.`);
    }

    if (activeCaffeine > req.user.caffeineLimit) {
      await triggerNotification(userId, 'caffeine_cutoff', `Caffeine warning: Active caffeine (${activeCaffeine}mg) exceeds your daily limit.`);
    }

    res.json({
      fatigueScore,
      fatigueLevel,
      sleepDebt,
      activeCaffeine,
      recoveryScore,
      waterIntake,
      awakeHours,
      lastNightSleep,
      lastSleepQuality,
      driveSafety,
      activeShift: activeShift ? {
        type: activeShift.shiftType,
        startedAt: activeShift.startTime,
        duration: activeShiftDuration
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating dashboard statistics', error: error.message });
  }
});

// @route   GET api/reports/weekly
// @desc    Retrieve weekly wellness analytics comparison reports
router.get('/weekly', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();

    // Current week: last 7 days
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - 7);

    // Prior week: 7 to 14 days ago
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 14);

    const allSleep = await SleepLog.find({ userId, startTime: { $gte: lastWeekStart } });
    const allCaffeine = await CaffeineLog.find({ userId, timestamp: { $gte: lastWeekStart } });
    const allShifts = await ShiftLog.find({ userId, startTime: { $gte: lastWeekStart } });
    const allNutrition = await NutritionLog.find({ userId, timestamp: { $gte: lastWeekStart } });

    // Helper to partition data
    const filterThisWeek = (arr, dateField) => arr.filter(x => new Date(x[dateField]) >= thisWeekStart);
    const filterLastWeek = (arr, dateField) => arr.filter(x => {
      const d = new Date(x[dateField]);
      return d >= lastWeekStart && d < thisWeekStart;
    });

    const sleepThisWeek = filterThisWeek(allSleep, 'startTime');
    const sleepLastWeek = filterLastWeek(allSleep, 'startTime');

    const caffeineThisWeek = filterThisWeek(allCaffeine, 'timestamp');
    const caffeineLastWeek = filterLastWeek(allCaffeine, 'timestamp');

    const shiftsThisWeek = filterThisWeek(allShifts, 'startTime');
    const shiftsLastWeek = filterLastWeek(allShifts, 'startTime');

    const nutritionThisWeek = filterThisWeek(allNutrition, 'timestamp');

    // Calculations
    const avgSleepThis = sleepThisWeek.length > 0 ? sleepThisWeek.reduce((s, x) => s + (x.duration || 0), 0) / sleepThisWeek.length : 0;
    const avgSleepLast = sleepLastWeek.length > 0 ? sleepLastWeek.reduce((s, x) => s + (x.duration || 0), 0) / sleepLastWeek.length : 0;

    const totalSleepThis = sleepThisWeek.reduce((s, x) => s + (x.duration || 0), 0);
    const totalSleepLast = sleepLastWeek.reduce((s, x) => s + (x.duration || 0), 0);

    const avgCaffeineThis = caffeineThisWeek.reduce((s, x) => s + (x.mgAmount || 0), 0);
    const avgCaffeineLast = caffeineLastWeek.reduce((s, x) => s + (x.mgAmount || 0), 0);

    const nightShiftsThis = shiftsThisWeek.filter(s => s.shiftType === 'Night').length;
    const nightShiftsLast = shiftsLastWeek.filter(s => s.shiftType === 'Night').length;

    // Macro breakdowns this week
    const totalCalories = nutritionThisWeek.reduce((s, x) => s + (x.calories || 0), 0);
    const totalProtein = nutritionThisWeek.reduce((s, x) => s + (x.protein || 0), 0);
    const totalCarbs = nutritionThisWeek.reduce((s, x) => s + (x.carbs || 0), 0);
    const totalFats = nutritionThisWeek.reduce((s, x) => s + (x.fats || 0), 0);

    // Compute average fatigue scores for past 7 days
    const fatigueHistoryThisWeek = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const score = calculators.calculateFatigueScore({
        user: req.user,
        sleepLogs: allSleep.filter(s => new Date(s.startTime) <= d),
        caffeineLogs: allCaffeine.filter(c => new Date(c.timestamp) <= d),
        shiftLogs: allShifts.filter(s => new Date(s.startTime) <= d),
        currentTime: d
      });
      fatigueHistoryThisWeek.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        score
      });
    }

    res.json({
      summary: {
        sleep: {
          avgThisWeek: parseFloat(avgSleepThis.toFixed(1)),
          avgLastWeek: parseFloat(avgSleepLast.toFixed(1)),
          totalThisWeek: parseFloat(totalSleepThis.toFixed(1)),
          totalLastWeek: parseFloat(totalSleepLast.toFixed(1))
        },
        caffeine: {
          totalThisWeek: avgCaffeineThis,
          totalLastWeek: avgCaffeineLast
        },
        shifts: {
          totalThisWeek: shiftsThisWeek.length,
          totalLastWeek: shiftsLastWeek.length,
          nightShiftsThis,
          nightShiftsLast
        },
        macros: {
          calories: Math.round(totalCalories / 7),
          protein: Math.round(totalProtein / 7),
          carbs: Math.round(totalCarbs / 7),
          fats: Math.round(totalFats / 7)
        }
      },
      fatigueTrend: fatigueHistoryThisWeek
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating weekly report', error: error.message });
  }
});

module.exports = router;
