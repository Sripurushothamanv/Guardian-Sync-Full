import React, { createContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc 
} from './firebase';

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

  // Subscribe to Firebase Authentication state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken();
          setToken(freshToken);
          localStorage.setItem('guardian_token', freshToken);

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { uid: firebaseUser.uid, ...userDoc.data() };
            setUser(userData);
            localStorage.setItem('guardian_user', JSON.stringify(userData));
          } else {
            const baseUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              role: 'Healthcare Worker'
            };
            setUser(prev => prev || baseUser);
            localStorage.setItem('guardian_user', JSON.stringify(baseUser));
          }
        } catch (_) {
          // Ignore offline fallback
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Authorization Headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // ==========================================
  // API REQUESTS & FALLBACK ENGINES
  // ==========================================

  // Firebase Direct Authentication & Profile creation
  const register = async (name, email, password, role, department, hospital) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCred.user;
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name,
          email,
          role,
          department: department || '',
          hospital: hospital || '',
          sleepGoal: 8,
          caffeineLimit: 400,
          waterGoal: 3000
        };

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        } catch (_) {}

        const freshToken = await firebaseUser.getIdToken();
        setToken(freshToken);
        setUser(userData);
        localStorage.setItem('guardian_token', freshToken);
        localStorage.setItem('guardian_user', JSON.stringify(userData));
        return { success: true };
      }
    } catch (err) {
      console.warn('Firebase registration error, attempting API/mock fallback:', err.message);
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, department, hospital })
        });
        const data = await res.json();
        if (res.ok) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('guardian_token', data.token);
          localStorage.setItem('guardian_user', JSON.stringify(data.user));
          return { success: true };
        }
      } catch (_) {}

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
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCred.user;
      if (firebaseUser) {
        const freshToken = await firebaseUser.getIdToken();
        let userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email || email,
          role: 'Healthcare Worker'
        };

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
          }
        } catch (_) {}

        setToken(freshToken);
        setUser(userData);
        localStorage.setItem('guardian_token', freshToken);
        localStorage.setItem('guardian_user', JSON.stringify(userData));
        return { success: true };
      }
    } catch (err) {
      console.warn('Firebase login failed, falling back:', err.message);
      const savedUser = JSON.parse(localStorage.getItem('guardian_user'));
      if (savedUser && savedUser.email === email) {
        setToken('mock_jwt_token_key');
        setUser(savedUser);
        localStorage.setItem('guardian_token', 'mock_jwt_token_key');
        return { success: true };
      }
      
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
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
    let rawSleepDebt = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date();
      day.setDate(now.getDate() - i);
      const dayStr = day.toDateString();
      
      const daySleepLogs = logs.sleep.filter(log => {
        return new Date(log.endTime).toDateString() === dayStr;
      });
      const duration = daySleepLogs.reduce((sum, log) => sum + log.duration, 0);
      rawSleepDebt += Math.max(0, sleepGoal - duration);
    }
    const sleepDebt = parseFloat(rawSleepDebt.toFixed(1));
    const effectiveSleepDebt = Math.min(10.0, sleepDebt);

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
    const rawScore = (effectiveSleepDebt * 3) + (awakeHours * 1.5) + shiftImpact - (activeCaffeine * 0.15);
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
      .filter(n => {
        const logDate = n.timestamp ? new Date(n.timestamp) : (n.createdAt ? new Date(n.createdAt) : null);
        return logDate && logDate.toDateString() === todayStr && (n.foodItem || '').toLowerCase().includes('water');
      })
      .reduce((sum, n) => sum + (n.volume || 250), 0);

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

    // Mock Notifications generator trigger with stable duplicate checks
    const newNotifs = [...notifications];
    const triggerMockAlert = (notifId, type, message) => {
      const exists = newNotifs.some(n => n._id === notifId || (n.type === type && n.message === message));
      if (!exists) {
        newNotifs.unshift({
          _id: notifId,
          type,
          message,
          timestamp: new Date(),
          read: false
        });
      }
    };

    if (score >= 80) {
      triggerMockAlert('mock_notif_burnout_crit', 'burnout', `Critical warning: Your fatigue is extremely high (${score}/100). Take immediate rest!`);
      triggerMockAlert('mock_notif_drive_crit', 'drive_warning', `Unsafe Drive Alert: Fatigue is critical. Please do NOT drive home.`);
    } else if (score >= 60) {
      triggerMockAlert('mock_notif_drive_warn', 'drive_warning', `Mild Drive Alert: Fatigue is high (${score}/100). Exercise caution.`);
    }
    if (activeCaffeine > (user ? user.caffeineLimit : 400)) {
      triggerMockAlert('mock_notif_caff_limit', 'caffeine_cutoff', `Caffeine warning: Active caffeine (${activeCaffeine}mg) exceeds your daily limit.`);
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
      const caffeineRegex = /(?:had|drank|have|consumed)?\s*(\d+)\s*(?:cups?|glasses|shots|cans|bottles)?\s*(?:of\s*)?(?:black\s*|filter\s*)?(coffees?|espressos?|energy\s*drinks?|teas?|monsters?|red\s*bulls?)/i;
      const caffeineMatch = normalized.match(caffeineRegex);
      if (caffeineMatch) {
        const count = parseInt(caffeineMatch[1], 10);
        const beverageRaw = (caffeineMatch[2] || 'coffee').toLowerCase();
        let beverage = 'Filter Coffee';
        let mgPerUnit = 95;
        if (beverageRaw.includes('espresso')) { beverage = 'Espresso'; mgPerUnit = 63; }
        else if (beverageRaw.includes('tea')) { beverage = 'Green/Black Tea'; mgPerUnit = 47; }
        else if (beverageRaw.includes('energy') || beverageRaw.includes('monster') || beverageRaw.includes('red bull')) { beverage = 'Energy Drink'; mgPerUnit = 160; }
        caffeine = { beverage, count, mgAmount: count * mgPerUnit };
      }

      // 3. Shift Parse
      let shift = null;
      const shiftRegex = /(?:worked|finished|had)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hour|hours|h)\s*(night|day|on-call|on\s*call|rotating)?\s*shift/i;
      const shiftMatch = normalized.match(shiftRegex);
      if (shiftMatch) {
        const duration = parseFloat(shiftMatch[1]);
        shift = { duration, shiftType: normalized.includes('night') ? 'Night' : 'Day', breakDuration: 30 };
      }

      // 4. Nutrition Parse (Expanded standard foods dictionary)
      const nutrition = [];
      const FOODS = { 
        'sambar rice': { calories: 350, protein: 8, carbs: 65, fats: 6 }, 
        'chicken curry': { calories: 380, protein: 32, carbs: 10, fats: 22 }, 
        'banana': { calories: 105, protein: 1, carbs: 27, fats: 0 }, 
        'sandwich': { calories: 320, protein: 12, carbs: 35, fats: 12 }, 
        'chapati': { calories: 120, protein: 3, carbs: 22, fats: 2 }, 
        'roti': { calories: 120, protein: 3, carbs: 22, fats: 2 }, 
        'biryani': { calories: 550, protein: 24, carbs: 70, fats: 18 }, 
        'pizza': { calories: 285, protein: 12, carbs: 36, fats: 10 },
        'salad': { calories: 150, protein: 5, carbs: 12, fats: 9 },
        'eggs': { calories: 140, protein: 12, carbs: 1, fats: 10 },
        'egg': { calories: 70, protein: 6, carbs: 1, fats: 5 },
        'pasta': { calories: 400, protein: 14, carbs: 68, fats: 8 },
        'oats': { calories: 200, protein: 7, carbs: 34, fats: 4 },
        'oatmeal': { calories: 200, protein: 7, carbs: 34, fats: 4 },
        'chicken': { calories: 250, protein: 30, carbs: 0, fats: 12 },
        'burger': { calories: 450, protein: 20, carbs: 40, fats: 22 },
        'fries': { calories: 365, protein: 4, carbs: 48, fats: 17 }
      };
      Object.keys(FOODS).forEach(f => {
        if (normalized.includes(f)) {
          const info = FOODS[f];
          nutrition.push({
            mealCategory: 'Lunch',
            foodItem: f.charAt(0).toUpperCase() + f.slice(1),
            calories: info.calories,
            protein: info.protein,
            carbs: info.carbs,
            fats: info.fats
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

  // Goal Management (Matching Mobile App)
  const addGoal = async (title, type, targetValue) => {
    if (goals.length >= 8) return;
    const newGoal = {
      _id: 'g_' + Date.now(),
      title,
      type,
      targetValue: Number(targetValue),
      currentValue: 0,
      completed: false,
      isCustom: true
    };
    setGoals(prev => [...prev, newGoal]);
    try {
      await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newGoal)
      });
    } catch (_) {}
  };

  const editGoal = async (id, title, targetValue) => {
    setGoals(prev => prev.map(g => {
      if (g._id === id) {
        const completed = (g.currentValue || 0) >= Number(targetValue);
        return { ...g, title, targetValue: Number(targetValue), completed };
      }
      return g;
    }));
    try {
      await fetch(`${API_BASE}/goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ title, targetValue: Number(targetValue) })
      });
    } catch (_) {}
  };

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g._id !== id));
    try {
      await fetch(`${API_BASE}/goals/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (_) {}
  };

  const addLogToGoal = (id, amount) => {
    setGoals(prev => prev.map(g => {
      if (g._id === id) {
        const newVal = (g.currentValue || 0) + Number(amount);
        const target = g.targetValue || 1;
        return { ...g, currentValue: newVal, completed: newVal >= target };
      }
      return g;
    }));
  };

  const setAwakeHours = (hours) => {
    const parsed = parseFloat(Number(hours).toFixed(1));
    setDashboardData(prev => ({
      ...prev,
      awakeHours: parsed
    }));
    runFallbackCalculations();
  };

  // Dynamic AI Chat Context Generator (Matching Flutter app_state.dart)
  const getAIChatResponse = (text) => {
    const norm = text.toLowerCase();
    const fatigueScore = dashboardData.fatigueScore ?? 25;
    const fatigueLevel = dashboardData.fatigueLevel ?? 'Low';
    const sleepDebt = dashboardData.sleepDebt ?? 1.0;
    const awakeHours = dashboardData.awakeHours ?? 6.0;
    const activeCaffeine = dashboardData.activeCaffeine ?? 0;
    const activeShift = dashboardData.activeShift;

    if (norm.includes('drive') || norm.includes('driving') || norm.includes('car') || norm.includes('travel')) {
      if (fatigueScore >= 70) {
        return `🚨 **HIGH FATIGUE WARNING (${fatigueScore}/100)**: You are currently evaluated at High Risk. Driving is UNSAFE. You have ${sleepDebt} hrs sleep debt and have been awake for ${awakeHours} hrs. Please pull over or rest before driving!`;
      } else if (fatigueScore >= 40) {
        return `⚠️ **MODERATE FATIGUE (${fatigueScore}/100)**: Drive with CAUTION. Your sleep debt is ${sleepDebt} hrs. Stay attentive and take regular breaks if driving long distance.`;
      } else {
        return `🟢 **SAFE TO DRIVE (${fatigueScore}/100)**: Your current fatigue index is within safe parameters (${fatigueLevel} Risk). Drive safely!`;
      }
    }

    if (norm.includes('tired') || norm.includes('fatigue') || norm.includes('score') || norm.includes('how am i')) {
      const shiftInfo = activeShift ? `Active Shift: ${activeShift.type} duty.` : 'No active shift logged.';
      return `📊 **Current Fatigue Status**:\n- Fatigue Index: **${fatigueScore}/100** (${fatigueLevel} Risk)\n- Sleep Debt: **${sleepDebt} hrs**\n- Hours Awake: **${awakeHours} hrs**\n- Active Caffeine: **${activeCaffeine} mg**\n- ${shiftInfo}`;
    }

    if (norm.includes('coffee') || norm.includes('caffeine') || norm.includes('drink') || norm.includes('tea')) {
      if (activeCaffeine > 350) {
        return `⛔ **Caffeine Threshold Reached**: Your active caffeine level is currently **${activeCaffeine} mg** (close to 400 mg daily safety cap). Additional caffeine may cause tremors or sleep disruption. Switch to hydration!`;
      } else if (fatigueScore > 50) {
        return `☕ **Caffeine Recommendation**: Your fatigue score is **${fatigueScore}/100** and active caffeine is **${activeCaffeine} mg**. 1 cup of Coffee (~95 mg) will temporarily improve alertness, but prioritize recovery sleep!`;
      } else {
        return `☕ Active caffeine level is **${activeCaffeine} mg**. Stay hydrated and maintain your current sleep schedule!`;
      }
    }

    if (norm.includes('sleep') || norm.includes('rest') || norm.includes('bed')) {
      return `🛌 **Sleep Analysis**: You currently have **${sleepDebt} hrs** of accumulated sleep debt. We recommend aiming for at least 7.5 to 8 hours of uninterrupted sleep tonight to recover your readiness index.`;
    }

    if (norm.includes('hello') || norm.includes('hi') || norm.includes('hey') || norm.includes('who are you')) {
      return 'Hello! I am your Guardian-Sync AI Assistant. I monitor your duty shifts, sleep debt, caffeine intake, and fatigue metrics in real-time. Ask me anything about your readiness or fatigue risk!';
    }

    return `🤖 **Guardian-Sync AI Context**:\nYour current fatigue index is **${fatigueScore}/100** (${fatigueLevel} Risk) with **${activeCaffeine} mg** active caffeine. You can dictate or type your sleep, caffeine, meals, or duty shifts to log them instantly!`;
  };

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
      addGoal,
      editGoal,
      deleteGoal,
      addLogToGoal,
      setAwakeHours,
      getAIChatResponse,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      fetchDashboard,
      fetchWeekly,
      fetchGoals,
      fetchNotifications,
      fetchStreaks,
      applyFatigueSimulation
    }}>
      {children}
    </AppContext.Provider>
  );
};
