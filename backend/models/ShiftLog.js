const mongoose = require('mongoose');

const ShiftLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  shiftType: { type: String, enum: ['Day', 'Night', 'Rotating', 'On-Call'], required: true },
  breakDuration: { type: Number, default: 0 }, // in minutes
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ShiftLog', ShiftLogSchema);
