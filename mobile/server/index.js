require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { normalizeEmail, ensureDemoUser } = require('./authHelpers');
const { connectFirebase } = require('./firebaseService');

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json());

let usersCollection;
let logsCollection;

function createToken(user) {
  const userIdStr = String(user._id || user.id);
  return jwt.sign({ sub: userIdStr, email: user.email }, jwtSecret, { expiresIn: '365d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, hospital } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await usersCollection.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = {
      name: name || 'User',
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Healthcare Worker',
      department: department || 'General',
      hospital: hospital || 'Guardian Sync',
      sleepGoal: 8,
      caffeineLimit: 400,
      waterGoal: 3000,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(userDoc);
    const user = { ...userDoc, _id: result.insertedId };
    delete user.password;
    const token = createToken(user);

    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const safeUser = { ...user, _id: user._id };
    delete safeUser.password;

    res.json({ token: createToken(safeUser), user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

app.get('/api/reports/dashboard', authMiddleware, async (req, res) => {
  const logs = await logsCollection.find({ userId: req.userId }).sort({ createdAt: -1 }).toArray();
  const fatigueScore = logs.length > 0 ? Math.min(100, 30 + logs.length * 5) : 25;
  res.json({
    fatigueScore,
    fatigueLevel: fatigueScore > 70 ? 'High' : 'Low',
    sleepDebt: 1.0,
    activeCaffeine: 0,
    recoveryScore: 85,
    waterIntake: 1000,
    awakeHours: 5.0,
    lastNightSleep: 7.5,
    lastSleepQuality: 'Good',
    driveSafety: {
      status: 'SAFE',
      color: '#10B981',
      advice: 'You are safe to drive. Stay hydrated.',
    },
    activeShift: null,
  });
});

app.get('/api/reports/weekly', authMiddleware, (req, res) => {
  res.json({
    weekLabel: 'This week',
    sleepAverage: 7.2,
    hydrationAverage: 2500,
    fatigueTrend: 'stable',
  });
});

app.get('/api/goals', authMiddleware, (req, res) => {
  res.json([
    { _id: 'g1', title: 'Sleep Duration >= 8 hrs', type: 'sleep', targetValue: 8, currentValue: 7.2, completed: false },
    { _id: 'g2', title: 'Caffeine Intake <= 400 mg', type: 'caffeine', targetValue: 400, currentValue: 120, completed: true },
    { _id: 'g3', title: 'Hydration Intake >= 3000 ml', type: 'water', targetValue: 3000, currentValue: 2500, completed: false },
  ]);
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json([]);
});

app.get('/api/goals/streak', authMiddleware, (req, res) => {
  res.json({ streakCount: 1, badges: [] });
});

app.post('/api/logs/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const payload = {
      ...req.body,
      userId: req.userId,
      type,
      createdAt: new Date(),
      timestamp: new Date().toISOString(),
    };
    await logsCollection.insertOne(payload);
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Log save failed' });
  }
});

app.post('/api/ai/parse', authMiddleware, (req, res) => {
  const { text = '' } = req.body;
  const normalized = text.toLowerCase();
  res.json({
    sleep: normalized.includes('sleep') ? { duration: 7.5, quality: 'Good', wakeUps: 0 } : null,
    caffeine: normalized.includes('coffee') ? { beverage: 'Filter Coffee', count: 1, mgAmount: 95 } : null,
    shift: normalized.includes('shift') ? { duration: 8, shiftType: 'Day', breakDuration: 30 } : null,
    nutrition: [],
  });
});

app.post('/api/ai/confirm', authMiddleware, async (req, res) => {
  const payload = req.body;
  if (payload.sleep) {
    await logsCollection.insertOne({ userId: req.userId, type: 'sleep', ...payload.sleep, createdAt: new Date() });
  }
  if (payload.caffeine) {
    await logsCollection.insertOne({ userId: req.userId, type: 'caffeine', ...payload.caffeine, createdAt: new Date() });
  }
  if (payload.shift) {
    await logsCollection.insertOne({ userId: req.userId, type: 'shift', ...payload.shift, createdAt: new Date() });
  }
  if (payload.nutrition) {
    for (const meal of payload.nutrition) {
      await logsCollection.insertOne({ userId: req.userId, type: 'nutrition', ...meal, createdAt: new Date() });
    }
  }
  res.json({ ok: true });
});

app.put('/api/goals/:id', authMiddleware, (req, res) => {
  res.json({ ok: true });
});

app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  res.json({ ok: true });
});

app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
  res.json({ ok: true });
});

app.delete('/api/notifications', authMiddleware, (req, res) => {
  res.json({ ok: true });
});

connectFirebase()
  .then(async (connections) => {
    usersCollection = connections.usersCollection;
    logsCollection = connections.logsCollection;
    await ensureDemoUser(usersCollection);
    app.listen(port, '0.0.0.0', () => console.log(`Server listening on port ${port} [Database: ${connections.type}]`));
  })
  .catch((error) => {
    console.error('Firebase connection failed', error);
    process.exit(1);
  });
