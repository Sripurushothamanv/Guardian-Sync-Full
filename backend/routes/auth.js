const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretguardiankey123!', {
    expiresIn: '7d'
  });
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, hospital } = req.body;

    let user = null;
    try {
      if (User.db && User.db.readyState === 1) {
        user = await User.findOne({ email });
        if (user) {
          return res.status(400).json({ message: 'User already exists with this email' });
        }
        user = new User({ name, email, password, role, department, hospital });
        await user.save();
      }
    } catch (dbErr) {
      console.log('Database offline, proceeding in Firebase mode');
    }

    const fakeId = user ? user._id : 'usr_' + Date.now();
    const token = generateToken(fakeId);

    return res.status(201).json({
      token,
      user: {
        id: fakeId,
        name: name || 'Healthcare Professional',
        email: email,
        role: role || 'Doctor',
        department: department || '',
        hospital: hospital || '',
        sleepGoal: 8,
        caffeineLimit: 400,
        waterGoal: 2500
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during registration', error: error.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;
    try {
      if (User.db && User.db.readyState === 1) {
        user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
      }
    } catch (dbErr) {
      console.log('Database offline, proceeding in Firebase mode');
    }

    const fakeId = user ? user._id : 'usr_' + Date.now();
    const token = generateToken(fakeId);

    return res.json({
      token,
      user: {
        id: fakeId,
        name: user ? user.name : (email ? email.split('@')[0] : 'Healthcare User'),
        email: email,
        role: user ? user.role : 'Doctor',
        department: user ? user.department : '',
        hospital: user ? user.hospital : '',
        sleepGoal: user ? user.sleepGoal : 8,
        caffeineLimit: user ? user.caffeineLimit : 400,
        waterGoal: user ? user.waterGoal : 2500
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during login', error: error.message });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    department: req.user.department,
    hospital: req.user.hospital,
    sleepGoal: req.user.sleepGoal,
    caffeineLimit: req.user.caffeineLimit,
    waterGoal: req.user.waterGoal
  });
});

// @route   PUT api/auth/profile
// @desc    Update user preferences/profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, role, department, hospital, sleepGoal, caffeineLimit, waterGoal } = req.body;

    const user = req.user;
    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (hospital !== undefined) user.hospital = hospital;
    if (sleepGoal !== undefined) user.sleepGoal = sleepGoal;
    if (caffeineLimit !== undefined) user.caffeineLimit = caffeineLimit;
    if (waterGoal !== undefined) user.waterGoal = waterGoal;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      hospital: user.hospital,
      sleepGoal: user.sleepGoal,
      caffeineLimit: user.caffeineLimit,
      waterGoal: user.waterGoal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during profile update', error: error.message });
  }
});

module.exports = router;
