require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Imports
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const aiRoutes = require('./routes/ai');
const goalsRoutes = require('./routes/goals');
const notificationRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');

// Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportsRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'firebase',
    timestamp: new Date()
  });
});

// Port settings
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Guardian-Sync Backend running on port ${PORT} (Firebase Mode)`));

module.exports = app;
