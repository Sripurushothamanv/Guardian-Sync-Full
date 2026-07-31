const mongoose = require('mongoose');

const SleepLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number }, // hours, calculated automatically
  quality: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'], required: true },
  wakeUps: { type: Number, default: 0 },
  recoveryScore: { type: Number } // 0-100 score calculated dynamically
}, { timestamps: true });

SleepLogSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const diffMs = this.endTime - this.startTime;
    this.duration = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
  }
  next();
});

module.exports = mongoose.model('SleepLog', SleepLogSchema);
