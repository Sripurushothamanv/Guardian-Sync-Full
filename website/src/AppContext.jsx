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
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('guardian_token') || null;
    } catch (_) {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('guardian_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return null;
  });

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
    try {
      const saved = localStorage.getItem('guardian_logs');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return { sleep: [], caffeine: [], shift: [], nutrition: [] };
  });

  // Track logs changes to persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('guardian_logs', JSON.stringify(logs));
    } catch (_) {}
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
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Healthcare Worker',
              email: firebaseUser.email,
              role: 'Healthcare Worker'
            };
            setUser(prev => prev || baseUser);
            localStorage.setItem('guardian_user', JSON.stringify(baseUser));
          }
        } catch (_) {}
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
  // AUTHENTICATION APIs
  // ==========================================

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
      console.warn('Firebase registration error, fallback local:', err.message);
      const mockUser = {
        uid: 'mock_user_' + Date.now(),
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
      console.warn('Firebase login failed, checking fallback:', err.message);
      const savedUser = JSON.parse(localStorage.getItem('guardian_user') || 'null');
      if (savedUser && savedUser.email === email) {
        setToken('mock_jwt_token_key');
        setUser(savedUser);
        localStorage.setItem('guardian_token', 'mock_jwt_token_key');
        return { success: true };
      }
      
      const mockUser = {
        uid: 'mock_user_1',
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
      if (res.ok) {
        setUser(data);
        localStorage.setItem('guardian_user', JSON.stringify(data));
        return;
      }
    } catch (_) {}
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem('guardian_user', JSON.stringify(updated));
  };

  // 1:1 Calculations Engine matching Flutter app_state.dart
  const runFallbackCalculations = () => {
    const sleepGoal = user ? user.sleepGoal : 8;
    const now = new Date();

    // 1. Decaying Caffeine (5-Hour Half-Life Exponential Decay)
    let activeCaffeine = 0;
    logs.caffeine.forEach(log => {
      const t = (now - new Date(log.timestamp)) / (1000 * 60 * 60);
      if (t >= 0 && t <= 24) {
        activeCaffeine += log.mgAmount * Math.pow(0.5, t / 5.0);
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

    // 5. Capped Caffeine Deduction & Fatigue Score
    const rawCaffeine = activeCaffeine * 0.15;
    const accumulatedFatigue = (effectiveSleepDebt * 3.0) + (awakeHours * 1.5) + shiftImpact;
    const caffeineDeduction = Math.min(accumulatedFatigue * 0.5, rawCaffeine);
    const score = Math.min(100, Math.max(0, Math.round(accumulatedFatigue - caffeineDeduction)));

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
  };

  const addLog = async (type, logData) => {
    const newLog = {
      _id: 'mock_log_' + Date.now() + Math.random(),
      createdAt: new Date(),
      ...logData
    };
    
    if (type === 'sleep') {
      const start = new Date(logData.startTime);
      const end = new Date(logData.endTime);
      const duration = parseFloat(((end - start) / (1000 * 60 * 60)).toFixed(2));
      newLog.duration = duration;
      
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

    setLogs(prev => ({
      ...prev,
      [type]: [newLog, ...(prev[type] || [])]
    }));
    runFallbackCalculations();
  };

  const parseAILog = (text) => {
    const norm = text.toLowerCase();
    const result = { sleep: null, caffeine: null, shift: null, nutrition: [] };

    // 1. Sleep Parsing
    const sleepMatch = norm.match(/(?:slept|sleep|rested)?\s*(\d+(?:\.\d+)?)\s*(?:hrs|hours|h|hour)/i);
    if (sleepMatch) {
      const duration = parseFloat(sleepMatch[1]) || 7.0;
      const quality = norm.includes('poor') || norm.includes('bad') || norm.includes('tired') ? 'Poor' : (norm.includes('great') || norm.includes('excellent') || norm.includes('deep') ? 'Excellent' : 'Good');
      result.sleep = {
        duration,
        quality,
        wakeUps: norm.includes('twice') ? 2 : (norm.includes('once') ? 1 : 0)
      };
    }

    // 2. Caffeine Parsing
    let caffCount = 1;
    const countMatch = norm.match(/(\d+)\s*(?:cups|cups of|servings|glasses|mugs)?\s*(?:coffee|espresso|tea|energy drink|chai)/i);
    if (countMatch) {
      caffCount = parseInt(countMatch[1], 10) || 1;
    }

    if (norm.includes('espresso')) {
      result.caffeine = { beverage: 'Espresso Shot', mgAmount: caffCount * 63 };
    } else if (norm.includes('energy drink') || norm.includes('red bull') || norm.includes('monster')) {
      result.caffeine = { beverage: 'Energy Drink', mgAmount: caffCount * 160 };
    } else if (norm.includes('tea') || norm.includes('chai')) {
      result.caffeine = { beverage: 'Green / Black Tea', mgAmount: caffCount * 47 };
    } else if (norm.includes('coffee') || norm.includes('cappuccino') || norm.includes('latte')) {
      result.caffeine = { beverage: 'Filter Coffee', mgAmount: caffCount * 95 };
    }

    // 3. Shift Parsing
    const shiftDurationMatch = norm.match(/(\d+(?:\.\d+)?)\s*(?:hrs|hours|h|hour)\s*(?:night|day|on-call|rotating)?\s*(?:duty|shift)/i);
    if (norm.includes('shift') || norm.includes('duty') || norm.includes('on-call')) {
      const shiftDuration = shiftDurationMatch ? parseFloat(shiftDurationMatch[1]) : 8.0;
      let shiftType = 'Day';
      if (norm.includes('night')) shiftType = 'Night';
      else if (norm.includes('on-call') || norm.includes('on call')) shiftType = 'On-Call';
      else if (norm.includes('rotating')) shiftType = 'Rotating';
      result.shift = { duration: shiftDuration, shiftType, breakDuration: 30 };
    }

    // 4. Nutrition & Hydration Parsing
    const waterMatch = norm.match(/(\d+)\s*(?:ml|milliliters|glass|glasses|water)/i);
    if (norm.includes('water') || waterMatch) {
      const vol = waterMatch ? parseInt(waterMatch[1], 10) : 250;
      result.nutrition.push({
        mealCategory: 'Hydration',
        foodItem: 'Water',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        volume: vol
      });
    }

    const dishDB = {
      'masala dosa': { name: 'Masala Dosa', c: 250, p: 5, car: 40, f: 8 },
      'dosa': { name: 'Plain Dosa', c: 120, p: 3, car: 22, f: 4 },
      'idli': { name: 'Idli', c: 60, p: 2, car: 12, f: 1 },
      'sambar': { name: 'Sambar Rice', c: 250, p: 6, car: 45, f: 5 },
      'chapati': { name: 'Chapati', c: 100, p: 3, car: 18, f: 3 },
      'roti': { name: 'Chapati', c: 100, p: 3, car: 18, f: 3 },
      'curd rice': { name: 'Curd Rice', c: 200, p: 5, car: 30, f: 6 },
      'sandwich': { name: 'Sandwich', c: 320, p: 12, car: 35, f: 12 }
    };

    Object.entries(dishDB).forEach(([key, data]) => {
      if (norm.includes(key)) {
        let qty = 1;
        const qtyMatch = norm.match(new RegExp(`(\\d+)\\s*(?:plates?|pieces?|portions?)?\\s*${key}`, 'i'));
        if (qtyMatch) qty = parseInt(qtyMatch[1], 10) || 1;

        result.nutrition.push({
          mealCategory: 'Meal',
          foodItem: `${qty} x ${data.name}`,
          calories: data.c * qty,
          protein: data.p * qty,
          carbs: data.car * qty,
          fats: data.f * qty
        });
      }
    });

    return result;
  };

  const addAILog = async (text) => {
    const parsed = parseAILog(text);
    const summaryParts = [];
    const now = new Date();

    if (parsed.sleep) {
      const end = now;
      const start = new Date(end.getTime() - (parsed.sleep.duration * 3600000));
      await addLog('sleep', {
        startTime: start,
        endTime: end,
        duration: parsed.sleep.duration,
        quality: parsed.sleep.quality,
        wakeUps: parsed.sleep.wakeUps
      });
      summaryParts.push(`🛌 Sleep: ${parsed.sleep.duration} hrs (${parsed.sleep.quality})`);
    }

    if (parsed.caffeine) {
      await addLog('caffeine', {
        beverage: parsed.caffeine.beverage,
        mgAmount: parsed.caffeine.mgAmount,
        timestamp: now
      });
      summaryParts.push(`☕ Caffeine: ${parsed.caffeine.beverage} (+${parsed.caffeine.mgAmount}mg)`);
    }

    if (parsed.shift) {
      const end = now;
      const start = new Date(end.getTime() - (parsed.shift.duration * 3600000));
      await addLog('shift', {
        startTime: start,
        endTime: end,
        duration: parsed.shift.duration,
        shiftType: parsed.shift.shiftType,
        breakDuration: parsed.shift.breakDuration
      });
      summaryParts.push(`🩺 Shift: ${parsed.shift.duration} hrs ${parsed.shift.shiftType}`);
    }

    if (parsed.nutrition && parsed.nutrition.length > 0) {
      for (const item of parsed.nutrition) {
        await addLog('nutrition', {
          mealCategory: item.mealCategory,
          foodItem: item.foodItem,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          volume: item.volume,
          timestamp: now
        });
        summaryParts.push(`🥗 ${item.foodItem}`);
      }
    }

    return {
      success: summaryParts.length > 0,
      summary: summaryParts.length > 0 ? summaryParts.join(' | ') : 'No identifiable metrics detected. Try e.g. "Slept 7 hours" or "Drank 2 cups of coffee".',
      parsed
    };
  };

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
  };

  const editGoal = async (id, title, targetValue) => {
    setGoals(prev => prev.map(g => {
      if (g._id === id) {
        const completed = (g.currentValue || 0) >= Number(targetValue);
        return { ...g, title, targetValue: Number(targetValue), completed };
      }
      return g;
    }));
  };

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g._id !== id));
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

  const applyFatigueSimulation = (simData) => {
    const { simSleepDebt, simAwakeHours, simCaffeine, simShiftType } = simData;
    let shiftImpact = 0;
    if (simShiftType === 'Night') shiftImpact = 30;
    else if (simShiftType === 'On-Call') shiftImpact = 25;
    else if (simShiftType === 'Rotating') shiftImpact = 20;
    else if (simShiftType === 'Day') shiftImpact = 10;

    const rawScore = (simSleepDebt * 3) + (simAwakeHours * 1.5) + shiftImpact - (simCaffeine * 0.15);
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    let level = 'Low';
    if (score >= 80) level = 'Critical';
    else if (score >= 60) level = 'High';
    else if (score >= 40) level = 'Moderate';

    let driveSafety = {
      status: 'SAFE',
      color: '#10B981',
      advice: 'You are safe to drive. Continue staying hydrated.'
    };
    if (score >= 70 || simAwakeHours > 18) {
      driveSafety = {
        status: 'UNSAFE',
        color: '#EF4444',
        advice: 'CRITICAL WARNING: Do NOT drive home. Rest immediately.'
      };
    } else if (score >= 55 || simAwakeHours >= 15) {
      driveSafety = {
        status: 'CAUTION',
        color: '#F59E0B',
        advice: 'CAUTION: Cognitive slowdown likely. Take a power nap.'
      };
    }

    setDashboardData(prev => ({
      ...prev,
      fatigueScore: score,
      fatigueLevel: level,
      sleepDebt: simSleepDebt,
      awakeHours: simAwakeHours,
      activeCaffeine: simCaffeine,
      driveSafety,
      activeShift: { type: simShiftType, duration: 0 }
    }));
  };

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
      addGoal,
      editGoal,
      deleteGoal,
      addLogToGoal,
      setAwakeHours,
      applyFatigueSimulation,
      getAIChatResponse
    }}>
      {children}
    </AppContext.Provider>
  );
};
