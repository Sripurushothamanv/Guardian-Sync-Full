const mongoose = require('mongoose');

const CaffeineLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beverage: { type: String, default: 'Filter Coffee' }, // Espresso, Filter, Tea, Energy Drink
  mgAmount: { type: Number, default: 95 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CaffeineLog', CaffeineLogSchema);
