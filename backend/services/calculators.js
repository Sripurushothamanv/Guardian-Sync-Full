const millisecondsInHour = 1000 * 60 * 60;

/**
 * Calculates the Caffeine Alertness (CA) active in the body.
 * Formula: CA = sum(caffeine_mg * e^(-0.1386 * t)) * 0.15
 * where t is the number of hours since intake. Half-life is 5 hours.
 */
function calculateCaffeineAlertness(caffeineLogs, currentTime = new Date()) {
  let ca = 0;
  const activeLogs = caffeineLogs.filter(log => {
    const elapsedHrs = (currentTime - new Date(log.timestamp)) / millisecondsInHour;
    return elapsedHrs >= 0 && elapsedHrs <= 24; // Limit to last 24h
  });

  activeLogs.forEach(log => {
    const t = (currentTime - new Date(log.timestamp)) / millisecondsInHour;
    const decay = Math.exp(-0.1386 * t);
    ca += (log.mgAmount * decay);
  });

  return ca * 0.15;
}

/**
 * Calculates the Fatigue Score (F, 0-100)
 * Formula: F = min(100, max(0, (SD * 3) + (AD * 1.5) + SI - CA))
 */
function calculateFatigueScore({ user, sleepLogs, caffeineLogs, shiftLogs, currentTime = new Date() }) {
  const sleepGoal = user.sleepGoal || 8;

  // 1. Sleep Debt (SD) over days with logged sleep
  let sleepDebt = 0;
  const last7Days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentTime);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    last7Days.push(date);
  }

  const daysWithLogs = last7Days.filter(dayStart => {
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return sleepLogs.some(log => {
      const end = new Date(log.endTime);
      return end >= dayStart && end < dayEnd;
    });
  });

  if (daysWithLogs.length > 0) {
    daysWithLogs.forEach(dayStart => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const sleepLogsForDay = sleepLogs.filter(log => {
        const end = new Date(log.endTime);
        return end >= dayStart && end < dayEnd;
      });
      const totalSleepOnDay = sleepLogsForDay.reduce((sum, log) => sum + (log.duration || 0), 0);
      sleepDebt += Math.max(0, sleepGoal - totalSleepOnDay);
    });
  } else {
    sleepDebt = 1.0;
  }

  // 2. Awake Duration (AD)
  let awakeDuration = 6.0; // default fallback if no sleep log for today
  if (sleepLogs.length > 0) {
    const sortedSleepLogs = [...sleepLogs].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    const lastSleep = sortedSleepLogs[0];
    const lastSleepEnd = new Date(lastSleep.endTime);
    const diffHours = (currentTime - lastSleepEnd) / millisecondsInHour;
    if (diffHours >= 0 && diffHours <= 48) {
      awakeDuration = diffHours;
    }
  }

  // 3. Shift Impact (SI)
  let shiftImpact = 0;
  const activeOrRecentShift = shiftLogs.find(shift => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    const isCurrent = currentTime >= start && currentTime <= end;
    const isRecent = currentTime > end && (currentTime - end) / millisecondsInHour <= 4;
    return isCurrent || isRecent;
  });

  if (activeOrRecentShift) {
    const type = activeOrRecentShift.shiftType;
    if (type === 'Night') shiftImpact = 30;
    else if (type === 'On-Call') shiftImpact = 25;
    else if (type === 'Rotating') shiftImpact = 20;
    else if (type === 'Day') shiftImpact = 10;
  }

  // 4. Caffeine Alertness (CA) - Cap deduction to 50% of accumulated fatigue
  const rawCaffeine = calculateCaffeineAlertness(caffeineLogs, currentTime);
  const accumulatedFatigue = (sleepDebt * 3) + (awakeDuration * 1.5) + shiftImpact;
  const caffeineDeduction = Math.min(accumulatedFatigue * 0.5, rawCaffeine);

  // Compute Fatigue Score strictly bounded (0-100)
  const score = accumulatedFatigue - caffeineDeduction;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Safe-to-Drive Decision Engine
 * Tiers: SAFE, MILD CAUTION, UNSAFE
 */
function evaluateDriveSafety({ fatigueScore, lastNightSleep, hoursAwake, activeShiftDuration }) {
  // SAFE TO DRIVE (Green)
  // Fatigue Score < 55 AND Sleep last night >= 6.5 hours AND awake time < 15 hours.
  if (fatigueScore < 55 && lastNightSleep >= 6.5 && hoursAwake < 15) {
    return {
      status: 'SAFE',
      color: '#10B981',
      advice: 'You are safe to drive. Continue staying hydrated and take deep breaths during the drive home.'
    };
  }

  // UNSAFE TO DRIVE (Red)
  // Fatigue Score >= 70 OR Sleep last night < 5 hours OR hours awake > 18 hours OR just finished a night shift >= 14 hours.
  if (fatigueScore >= 70 || lastNightSleep < 5 || hoursAwake > 18 || activeShiftDuration >= 14) {
    return {
      status: 'UNSAFE',
      color: '#EF4444',
      advice: 'CRITICAL WARNING: Do NOT drive. Take a rideshare, call a coworker/family member, use public transit, or sleep in the hospital call-room.'
    };
  }

  // MILD CAUTION (Yellow)
  // Fatigue Score between 55 and 70 OR Sleep last night between 5 and 6.5 hours OR active shift duration > 12 hours.
  return {
    status: 'CAUTION',
    color: '#F59E0B',
    advice: 'CAUTION: Cognitive slowdown likely. Take a 15-minute power nap or consume coffee/water before hitting the road. Avoid highway driving if possible.'
  };
}

/**
 * Calculates Burnout Risk Index (0-100%)
 */
function calculateBurnoutRisk(fatigueScores, nightShiftCount7Days) {
  if (fatigueScores.length === 0) return 0;

  // Average fatigue score of the last 7 days
  const averageFatigue = fatigueScores.reduce((sum, s) => sum + s, 0) / fatigueScores.length;

  // Burnout multiplier if night shifts exceed 3 consecutive or total in a 7-day period
  let multiplier = 1.0;
  if (nightShiftCount7Days >= 3) {
    multiplier = 1.2;
  }

  const baseBurnout = averageFatigue * multiplier;
  return Math.min(100, Math.max(0, Math.round(baseBurnout)));
}

module.exports = {
  calculateCaffeineAlertness,
  calculateFatigueScore,
  evaluateDriveSafety,
  calculateBurnoutRisk
};
