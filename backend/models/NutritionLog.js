const mongoose = require('mongoose');

const NutritionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealCategory: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Breakfast' },
  foodItem: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // grams
  carbs: { type: Number, default: 0 }, // grams
  fats: { type: Number, default: 0 }, // grams
  fiber: { type: Number, default: 0 }, // grams
  sodium: { type: Number, default: 0 }, // milligrams
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('NutritionLog', NutritionLogSchema);
