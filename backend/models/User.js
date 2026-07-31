const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Doctor', 'Nurse', 'Intern', 'Night-Shift Staff', 'Other'], default: 'Doctor' },
  department: { type: String, default: '' },
  hospital: { type: String, default: '' },
  sleepGoal: { type: Number, default: 8 }, // hours
  caffeineLimit: { type: Number, default: 400 }, // mg
  waterGoal: { type: Number, default: 3000 } // ml
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
