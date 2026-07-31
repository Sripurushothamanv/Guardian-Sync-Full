const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }, // e.g., "Sleep >= 7.5 hours"
  type: { type: String, enum: ['sleep', 'caffeine', 'water', 'shift_limit', 'nutrition'], required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);
