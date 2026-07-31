import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('guardian_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('guardian_user')) || null);
  const [dashboardData, setDashboardData] = useState({
    fatigueScore: 28,
    fatigueLevel: 'Low',
    sleepDebt: 1.5,
    activeCaffeine: 45,
    recoveryScore: 82,
    waterIntake: 1250,
    awakeHours: 6.2,
    lastNightSleep: 7.2,
    lastSleepQuality: 'Good',
    driveSafety: {
      status: 'SAFE',
      color: '#10B981',
      advice: 'You are safe to drive. Continue staying hydrated and take deep breaths during the drive home.'
    },
    activeShift: null
  });
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [streakInfo, setStreakInfo] = useState({ streakCount: 3, badges: [] });
  const [weeklyReport, setWeeklyReport] = useState(null);
  
  // Local Logs (Fallback Database)
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('guardian_logs');
    return saved ? JSON.parse(saved) : { sleep: [], caffeine: [], shift: [], nutrition: [] };
  });

  // Track logs changes to persist to local storage
  useEffect(() => {
    localStorage.setItem('guardian_logs', JSON.stringify(logs));
  }, [logs]);

  // Authorization Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // ==========================================
  // API REQUESTS & FALLBACK ENGINES
  // ==========================================

  // Authentication API
  const register = async (name, email, password, role, department, hospital) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, department, hospital })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('guardian_token', data.token);
      localStorage.setItem('guardian_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock registration:', err.message);
      // Fallback
      const mockUser = {
        id: 'mock_user_' + Date.now(),
        name,
        email,
        role,
        department,
        hospital,
        sleepGoal: 8,
        caffeineLimit: 400,
        waterGoal: 3000
      };
      setToken('mock_jwt_token_key');
      setUser(mockUser);
      localStorage.setItem('guardian_token', 'mock_jwt_token_key');
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('guardian_token', data.token);
      localStorage.setItem('guardian_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      console.warn('Backend unavailable, checking local fallback auth:', err.message);
      const savedUser = JSON.parse(localStorage.getItem('guardian_user'));
      if (savedUser && savedUser.email === email) {
        setToken('mock_jwt_token_key');
        setUser(savedUser);
        localStorage.setItem('guardian_token', 'mock_jwt_token_key');
        return { success: true };
      }
      
      // Auto-create user if first login in offline mock
      const mockUser = {
        id: 'mock_user_1',
        name: 'Dr. Sarah Connor',
        email,
        role: 'Doctor',
        department: 'ICU / Emergency',
        hospital: 'City General Hospital',
        sleepGoal: 8,
        caffeineLimit: 400,
        waterGoal: 3000
      };
      setToken('mock_jwt_token_key');
      setUser(mockUser);
      localStorage.setItem('guardian_token', 'mock_jwt_token_key');
      localStorage.setItem('guardian_user', JSON.stringify(mockUser));
      return { success: true };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('guardian_token');
    localStorage.removeItem('guardian_user');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUser(data);
      localStorage.setItem('guardian_user', JSON.stringify(data));
    } catch (err) {
      console.warn('Backend update failed, saving profile mock:', err.message);
      const updated = { ...user, ...profileData };
      setUser(updated);
      localStorage.setItem('guardian_user', JSON.stringify(updated));
    }
  };

  // Calculations Engine for Client-Side Fallback
  const runFallbackCalculations = () => {
    const sleepGoal = user ? user.sleepGoal : 8;
    const now = new Date();

    // 1. Decaying Caffeine
    let activeCaffeine = 0;
    logs.caffeine.forEach(log => {
      const t = (now - new Date(log.timestamp)) / (1000 * 60 * 60);
      if (t >= 0 && t <= 24) {
        activeCaffeine += log.mgAmount * Math.exp(-0.1386 * t);
      }
    });
    activeCaffeine = Math.round(activeCaffeine);

    // 2. Sleep Debt (Last 7 Days)
    let sleepDebt = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(now.getDate() - i);
      const dayStr = day.toDateString();
      
      const daySleepLogs = logs.sleep.filter(log => {
        return new Date(log.endTime).toDateString() === dayStr;
      });
      const duration = daySleepLogs.reduce((sum, log) => sum + log.duration, 0);
      sleepDebt += Math.max(0, sleepGoal - duration);
    }
    sleepDebt = parseFloat(sleepDebt.toFixed(1));

    // 3. Awake Hours
    let awakeHours = 12;
    let lastNightSleep = 7.5;
    let lastSleepQuality = 'Good';
    let recoveryScore = 80;
    if (logs.sleep.length > 0) {
      const sorted = [...logs.sleep].sort((a,b) => new Date(b.endTime) - new Date(a.endTime));
      const latest = sorted[0];
      lastNightSleep = latest.duration;
      lastSleepQuality = latest.quality;
      recoveryScore = latest.recoveryScore;
      const diffHrs = (now - new Date(latest.endTime)) / (1000 * 60 * 60);
      if (diffHrs >= 0) awakeHours = parseFloat(diffHrs.toFixed(1));
    }

    // 4. Shift Impact
    let shiftImpact = 0;
    let activeShift = null;
    const recentShift = logs.shift.find(s => {
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      const isCurrent = now >= start && now <= end;
      const isRecent = now > end && (now - end) / (1000 * 60 * 60) <= 4;
      return isCurrent || isRecent;
    });

    if (recentShift) {
      const type = recentShift.shiftType;
      if (type === 'Night') shiftImpact = 30;
      else if (type === 'On-Call') shiftImpact = 25;
      else if (type === 'Rotating') shiftImpact = 20;
      else shiftImpact = 10;

      const isCurrent = now >= new Date(recentShift.startTime) && now <= new Date(recentShift.endTime);
      if (isCurrent) {
        activeShift = {
          type: recentShift.shiftType,
          startedAt: recentShift.startTime,
          duration: parseFloat(((now - new Date(recentShift.startTime)) / (1000 * 60 * 60)).toFixed(1))
        };
      }
    }

    // 5. Calculate Fatigue Score (F)
    const rawScore = (sleepDebt * 3) + (awakeHours * 1.5) + shiftImpact - (activeCaffeine * 0.15);
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    let level = 'Low';
    if (score >= 80) level = 'Critical';
    else if (score >= 60) level = 'High';
    else if (score >= 40) level = 'Moderate';

    // 6. Safe to drive status
    let driveSafety = {
      status: 'SAFE',
      color: '#10B981',
      advice: 'You are safe to drive. Continue staying hydrated and take deep breaths during the drive home.'
    };
    if (score >= 70 || lastNightSleep < 5 || awakeHours > 18) {
      driveSafety = {
        status: 'UNSAFE',
        color: '#EF4444',
        advice: 'CRITICAL WARNING: Do NOT drive. Take a rideshare, call a coworker/family member, use public transit, or sleep in the hospital call-room.'
      };
    } else if (score >= 55 || lastNightSleep < 6.5 || awakeHours >= 15) {
      driveSafety = {
        status: 'CAUTION',
        color: '#F59E0B',
        advice: 'CAUTION: Cognitive slowdown likely. Take a 15-minute power nap or consume coffee/water before hitting the road.'
      };
    }

    // 7. Water Intake Today
    const todayStr = now.toDateString();
    const waterIntake = logs.nutrition
      .filter(n => new Date(n.timestamp).toDateString() === todayStr && n.foodItem.toLowerCase().includes('water'))
      .reduce((sum, n) => sum + (n.calories || 250), 0);

    const calculatedDash = {
      fatigueScore: score,
      fatigueLevel: level,
      sleepDebt,
      activeCaffeine,
      recoveryScore,
      waterIntake,
      awakeHours,
      lastNightSleep,
      lastSleepQuality,
      driveSafety,
      activeShift
    };

    setDashboardData(calculatedDash);

    // Mock Notifications generator trigger
    const newNotifs = [...notifications];
    const triggerMockAlert = (type, message) => {
      const exists = newNotifs.some(n => n.type === type && n.message === message);
      if (!exists) {
        newNotifs.unshift({
          _id: 'mock_notif_' + Date.now() + Math.random(),
          type,
          message,
          timestamp: new Date(),
          read: false
        });
      }
    };

    if (score >= 80) {
      triggerMockAlert('burnout', `Critical warning: Your fatigue is extremely high (${score}/100). Take immediate rest!`);
      triggerMockAlert('drive_warning', `Unsafe Drive Alert: Fatigue is critical. Please do NOT drive home.`);
    } else if (score >= 60) {
      triggerMockAlert('drive_warning', `Mild Drive Alert: Fatigue is high (${score}/100). Exercise caution.`);
    }
    if (activeCaffeine > (user ? user.caffeineLimit : 400)) {
      triggerMockAlert('caffeine_cutoff', `Caffeine warning: Active caffeine (${activeCaffeine}mg) exceeds your daily limit.`);
    }
    setNotifications(newNotifs);

    // Generate Goals Mock Progresses
    const mockGoals = [
      {
        _id: 'g1',
        title: `Sleep Duration >= ${sleepGoal} hrs`,
        type: 'sleep',
        targetValue: sleepGoal,
        currentValue: lastNightSleep,
        completed: lastNightSleep >= sleepGoal
      },
      {
        _id: 'g2',
        title: `Caffeine Intake <= ${user ? user.caffeineLimit : 400} mg`,
        type: 'caffeine',
        targetValue: user ? user.caffeineLimit : 400,
        currentValue: activeCaffeine,
        completed: activeCaffeine <= (user ? user.caffeineLimit : 400)
      },
      {
        _id: 'g3',
        title: `Hydration Intake >= ${user ? user.waterGoal : 3000} ml`,
        type: 'water',
        targetValue: user ? user.waterGoal : 3000,
        currentValue: waterIntake,
        completed: waterIntake >= (user ? user.waterGoal : 3000)
      },
      {
        _id: 'g4',
        title: 'Shift Break Duration >= 30 mins',
        type: 'shift_limit',
        targetValue: 30,
        currentValue: logs.shift.reduce((sum, s) => sum + s.breakDuration, 0),
        completed: logs.shift.reduce((sum, s) => sum + s.breakDuration, 0) >= 30
      },
      {
        _id: 'g5',
        title: 'Total Calorie Intake <= 2500 kcal',
        type: 'nutrition',
        targetValue: 2500,
        currentValue: logs.nutrition.filter(n => new Date(n.timestamp).toDateString() === todayStr).reduce((sum, n) => sum + n.calories, 0),
        completed: logs.nutrition.filter(n => new Date(n.timestamp).toDateString() === todayStr).reduce((sum, n) => sum + n.calories, 0) > 0 && 
                   logs.nutrition.filter(n => new Date(n.timestamp).toDateString() === todayStr).reduce((sum, n) => sum + n.calories, 0) <= 2500
      }
    ];
    setGoals(mockGoals);

    // Streaks and badges Mock
    const streak = Math.min(10, Math.max(1, logs.sleep.length + logs.caffeine.length));
    setStreakInfo({
      streakCount: streak,
      badges: [
        { id: 'b1', title: 'First Step', description: 'Joined Guardian-Sync and started tracking wellness.', icon: '🌱', unlocked: true },
        { id: 'b2', title: 'Sleep Champion', description: 'Logged sleep 3+ times to manage sleep debt.', icon: '😴', unlocked: logs.sleep.length >= 3 },
        { id: 'b3', title: 'Night Shift Survivor', description: 'Completed 3+ overnight shifts.', icon: '🦇', unlocked: logs.shift.filter(s => s.shiftType==='Night').length >= 3 },
        { id: 'b4', title: '7-Day Streak Warrior', description: 'Completed wellness goals 7 consecutive days.', icon: '🔥', unlocked: streak >= 7 },
        { id: 'b5', title: 'Caffeine Commander', description: 'Logged caffeine intake 5+ times.', icon: '☕', unlocked: logs.caffeine.length >= 5 }
      ]
    });

    // Mock Weekly Reports
    const weeklyFatigue = [
      { day: 'Mon', score: Math.round(score * 0.9) },
      { day: 'Tue', score: Math.round(score * 1.1) },
      { day: 'Wed', score: Math.round(score * 1.2) },
      { day: 'Thu', score: Math.round(score * 0.95) },
      { day: 'Fri', score: Math.round(score * 0.85) },
      { day: 'Sat', score: score },
      { day: 'Sun', score }
    ];
    setWeeklyReport({
      summary: {
        sleep: { avgThisWeek: 7.2, avgLastWeek: 6.8, totalThisWeek: 50.4, totalLastWeek: 47.6 },
        caffeine: { totalThisWeek: 450, totalLastWeek: 680 },
        shifts: { totalThisWeek: 5, totalLastWeek: 6, nightShiftsThis: 2, nightShiftsLast: 4 },
        macros: { calories: 2150, protein: 85, carbs: 240, fats: 72 }
      },
      fatigueTrend: weeklyFatigue
    });
  };

  // Fetch Dashboard API / Local Fallback
  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/reports/dashboard`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      runFallbackCalculations();
    }
  };

  const fetchWeekly = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/reports/weekly`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setWeeklyReport(data);
    } catch (err) {
      runFallbackCalculations();
    }
  };

  const fetchGoals = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/goals`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      runFallbackCalculations();
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      // Handled by runFallbackCalculations loading state
    }
  };

  const fetchStreaks = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/goals/streak`, { headers: getHeaders() });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setStreakInfo(data);
    } catch (err) {
      runFallbackCalculations();
    }
  };

  // Log CRUD triggers
  const addLog = async (type, logData) => {
    if (!token) return;
    try {
      // shift maps to 'shift', other types map as they are
      const endpoint = type === 'shift' ? 'shift' : type;
      const res = await fetch(`${API_BASE}/logs/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData)
      });
      if (!res.ok) throw new Error('API failed');
      
      await fetchDashboard();
      await fetchGoals();
      await fetchStreaks();
    } catch (err) {
      console.warn(`Backend logger offline, adding log locally for ${type}`);
      // Fallback
      const newLog = {
        _id: 'mock_log_' + Date.now() + Math.random(),
        createdAt: new Date(),
        ...logData
      };
      
      // Calculate duration & recovery if sleep log
      if (type === 'sleep') {
        const start = new Date(logData.startTime);
        const end = new Date(logData.endTime);
        const duration = parseFloat(((end - start) / (1000 * 60 * 60)).toFixed(2));
        newLog.duration = duration;
        
        // Calculate recovery score
        let base = 50;
        const durDiff = Math.abs(8 - duration);
        if (durDiff < 1) base += 25;
        else if (durDiff < 2) base += 15;
        if (logData.quality === 'Excellent') base += 25;
        else if (logData.quality === 'Good') base += 15;
        else if (logData.quality === 'Poor') base -= 15;
        base -= ((logData.wakeUps || 0) * 5);
        newLog.recoveryScore = Math.min(100, Math.max(0, base));
      }

      setLogs(prev => {
        const updated = { ...prev };
        updated[type] = [newLog, ...updated[type]];
        return updated;
      });
    }
  };

  // AI Extraction NLP parsing
  const addAILog = async (text) => {
    try {
      const res = await fetch(`${API_BASE}/ai/parse`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('API parse failed');
      return data;
    } catch (err) {
      console.warn('Backend NLP offline, parsing via frontend regex parser:', err.message);
      // Match Regex fallback directly on frontend
      const normalized = text.toLowerCase();
      
      // 1. Sleep Parse
      let sleep = null;
      const sleepRegex = /(?:slept|sleep)\s*(?:for|only)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\b|(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\s*(?:of\s*)?sleep/i;
      const sleepMatch = normalized.match(sleepRegex);
      if (sleepMatch) {
        const duration = parseFloat(sleepMatch[1] || sleepMatch[2]);
        sleep = { duration, quality: normalized.includes('poor') || normalized.includes('bad') ? 'Poor' : 'Good', wakeUps: normalized.includes('woke up once') ? 1 : 0 };
      }

      // 2. Caffeine Parse
      let caffeine = null;
      const caffeineRegex = /(?:had|drank|have|consumed)?\s*(\d+)\s*(?:cups?|glasses|shots)?\s*(?:of\s*)?(coffees?|espressos?|energy\s*drinks?|teas?|monsters?|red\s*bulls?)/i;
      const caffeineMatch = normalized.match(caffeineRegex);
      if (caffeineMatch) {
        const count = parseInt(caffeineMatch[1], 10);
        caffeine = { beverage: 'Filter Coffee', count, mgAmount: count * 95 };
      }

      // 3. Shift Parse
      let shift = null;
      const shiftRegex = /(?:worked|finished|had)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\s*(night|day|on-call|on\s*call|rotating)?\s*shift/i;
      const shiftMatch = normalized.match(shiftRegex);
      if (shiftMatch) {
        const duration = parseFloat(shiftMatch[1]);
        shift = { duration, shiftType: normalized.includes('night') ? 'Night' : 'Day', breakDuration: 30 };
      }

      // 4. Nutrition Parse (Mock standard foods)
      const nutrition = [];
      const FOODS = { 'sambar rice': 350, 'chicken curry': 380, 'banana': 105, 'sandwich': 320, 'chapati': 120, 'roti': 120, 'biryani': 550, 'pizza': 285 };
      Object.keys(FOODS).forEach(f => {
        if (normalized.includes(f)) {
          nutrition.push({
            mealCategory: 'Lunch',
            foodItem: f.charAt(0).toUpperCase() + f.slice(1),
            calories: FOODS[f],
            protein: f.includes('chicken') ? 30 : 6,
            carbs: f.includes('rice') ? 60 : 25,
            fats: f.includes('curry') ? 20 : 2
          });
        }
      });

      return { sleep, caffeine, shift, nutrition };
    }
  };

  const confirmAILog = async (parsedData) => {
    try {
      const res = await fetch(`${API_BASE}/ai/confirm`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(parsedData)
      });
      if (!res.ok) throw new Error('API confirm failed');
      await fetchDashboard();
      await fetchGoals();
      await fetchStreaks();
    } catch (err) {
      console.warn('Backend NLP confirm offline, saving logs locally:');
      
      if (parsedData.sleep) {
        await addLog('sleep', {
          startTime: new Date(Date.now() - parsedData.sleep.duration * 3600000),
          endTime: new Date(),
          quality: parsedData.sleep.quality || 'Good',
          wakeUps: parsedData.sleep.wakeUps || 0
        });
      }

      if (parsedData.caffeine) {
        await addLog('caffeine', {
          beverage: parsedData.caffeine.beverage || 'Filter Coffee',
          mgAmount: parsedData.caffeine.mgAmount,
          timestamp: new Date()
        });
      }

      if (parsedData.shift) {
        await addLog('shift', {
          startTime: new Date(Date.now() - parsedData.shift.duration * 3600000),
          endTime: new Date(),
          shiftType: parsedData.shift.shiftType || 'Day',
          breakDuration: parsedData.shift.breakDuration || 30
        });
      }

      if (parsedData.nutrition && parsedData.nutrition.length > 0) {
        for (const meal of parsedData.nutrition) {
          await addLog('nutrition', meal);
        }
      }
      
      runFallbackCalculations();
    }
  };

  // Goals API actions
  const updateGoal = async (id, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error('API update failed');
      await fetchGoals();
    } catch (err) {
      setGoals(prev => prev.map(g => g._id === id ? { ...g, ...updateData } : g));
    }
  };

  // Notifications API actions
  const markNotificationRead = async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() });
      await fetchNotifications();
    } catch (err) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT', headers: getHeaders() });
      await fetchNotifications();
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch(`${API_BASE}/notifications`, { method: 'DELETE', headers: getHeaders() });
      setNotifications([]);
    } catch (err) {
      setNotifications([]);
    }
  };

  // Sync everything on mount and auth changes
  useEffect(() => {
    if (token) {
      fetchDashboard();
      fetchWeekly();
      fetchGoals();
      fetchNotifications();
      fetchStreaks();
    } else {
      // Clear data states if unauthenticated
      setGoals([]);
      setNotifications([]);
    }
  }, [token]);

  // Recalculate dashboard periodically if offline
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchDashboard();
    }, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [token, logs]);

  return (
    <AppContext.Provider value={{
      token,
      user,
      dashboardData,
      goals,
      notifications,
      streakInfo,
      weeklyReport,
      logs,
      login,
      register,
      logout,
      updateProfile,
      addLog,
      addAILog,
      confirmAILog,
      updateGoal,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      fetchDashboard,
      fetchWeekly,
      fetchGoals,
      fetchNotifications,
      fetchStreaks
    }}>
      {children}
    </AppContext.Provider>
  );
};
