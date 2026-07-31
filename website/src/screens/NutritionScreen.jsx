import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Utensils, Flame, Droplets, Plus } from 'lucide-react';

export default function NutritionScreen() {
  const { addLog, logs } = useContext(AppContext);
  const [foodItem, setFoodItem] = useState('');
  const [category, setCategory] = useState('Lunch');
  const [calories, setCalories] = useState('350');
  const [protein, setProtein] = useState('15');
  const [carbs, setCarbs] = useState('45');
  const [fats, setFats] = useState('10');
  const [waterVolume, setWaterVolume] = useState('250');

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    await addLog('nutrition', {
      mealCategory: category,
      foodItem,
      calories: parseInt(calories, 10),
      protein: parseInt(protein, 10),
      carbs: parseInt(carbs, 10),
      fats: parseInt(fats, 10),
      timestamp: new Date()
    });
    setFoodItem('');
  };

  const handleWaterSubmit = async () => {
    await addLog('nutrition', {
      mealCategory: 'Hydration',
      foodItem: 'Water',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      volume: parseInt(waterVolume, 10),
      timestamp: new Date()
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Utensils size={28} color="#10b981" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Log Meal & Hydration</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Track calories, macros & water intake</p>
          </div>
        </div>

        {/* Quick Hydration Card */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={18} color="#06b6d4" /> Quick Hydration Log
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['250', '500', '750'].map(vol => (
              <button key={vol} type="button" onClick={() => { setWaterVolume(vol); handleWaterSubmit(); }} className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', backgroundColor: 'rgba(6, 182, 212, 0.25)', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                +{vol} ml
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleMealSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Food / Dish Name</label>
            <input type="text" placeholder="e.g. Sambar Rice & Salad" value={foodItem} onChange={e => setFoodItem(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Calories (kcal)</label>
              <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Protein (g)</label>
              <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Carbs (g)</label>
              <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Fats (g)</label>
              <input type="number" value={fats} onChange={e => setFats(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            Log Meal Entry
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Today's Nutrition Logs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto' }}>
          {logs.nutrition && logs.nutrition.length > 0 ? (
            logs.nutrition.map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'block' }}>{item.foodItem}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{item.mealCategory} • P:{item.protein || 0}g C:{item.carbs || 0}g F:{item.fats || 0}g</span>
                </div>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{item.calories ? `${item.calories} kcal` : `${item.volume || 250} ml`}</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No meals recorded today.</p>
          )}
        </div>
      </div>
    </div>
  );
}
