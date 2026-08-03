import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import AIVoiceBar from '../components/AIVoiceBar';
import { Utensils, Droplets, Sparkles } from 'lucide-react';

export default function NutritionScreen() {
  const { addLog, logs } = useContext(AppContext);
  const [foodItem, setFoodItem] = useState('');
  const [category, setCategory] = useState('Lunch');
  const [calories, setCalories] = useState('350');
  const [protein, setProtein] = useState('15');
  const [carbs, setCarbs] = useState('45');
  const [fats, setFats] = useState('10');
  const [waterVolume, setWaterVolume] = useState('250');
  const [autoPredicted, setAutoPredicted] = useState(false);

  // Macro Estimation Database
  const macroDatabase = [
    { keywords: ['egg', 'eggs', 'scrambled'], c: 150, p: 12, car: 2, f: 10 },
    { keywords: ['toast', 'bread'], c: 120, p: 4, car: 22, f: 2 },
    { keywords: ['idli', 'idly'], c: 70, p: 2, car: 14, f: 1 },
    { keywords: ['sambar', 'sambhar'], c: 110, p: 4, car: 18, f: 3 },
    { keywords: ['dosa', 'dosai'], c: 180, p: 4, car: 28, f: 6 },
    { keywords: ['masala dosa'], c: 280, p: 6, car: 42, f: 9 },
    { keywords: ['chapati', 'roti', 'phulka'], c: 100, p: 3, car: 18, f: 3 },
    { keywords: ['curd rice'], c: 220, p: 6, car: 32, f: 7 },
    { keywords: ['chicken', 'chicken breast', 'grilled chicken'], c: 260, p: 32, car: 0, f: 12 },
    { keywords: ['sandwich'], c: 320, p: 14, car: 36, f: 12 },
    { keywords: ['salad'], c: 120, p: 3, car: 12, f: 6 },
    { keywords: ['rice', 'steamed rice', 'chicken rice'], c: 200, p: 4, car: 44, f: 1 },
    { keywords: ['biryani', 'chicken biryani'], c: 450, p: 24, car: 55, f: 16 },
    { keywords: ['paneer', 'paneer butter'], c: 380, p: 18, car: 14, f: 28 },
    { keywords: ['dal', 'dal tadka'], c: 180, p: 9, car: 26, f: 5 },
    { keywords: ['oats', 'oatmeal'], c: 190, p: 6, car: 32, f: 4 },
    { keywords: ['apple', 'fruit'], c: 80, p: 0, car: 20, f: 0 },
    { keywords: ['banana'], c: 105, p: 1, car: 27, f: 0 },
    { keywords: ['burger'], c: 480, p: 22, car: 42, f: 24 },
    { keywords: ['pizza'], c: 300, p: 12, car: 34, f: 12 },
    { keywords: ['poha'], c: 180, p: 3, car: 32, f: 5 },
    { keywords: ['upma'], c: 190, p: 4, car: 30, f: 6 }
  ];

  // Auto Macro Estimator logic
  useEffect(() => {
    if (!foodItem.trim()) {
      setAutoPredicted(false);
      return;
    }

    const norm = foodItem.toLowerCase();
    
    // Extract multiplier quantity (e.g., '2 eggs', '3 idli')
    let quantity = 1;
    const qtyMatch = norm.match(/^(\d+)\s+/);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10) || 1;
    }

    let matchedCalories = 0;
    let matchedProtein = 0;
    let matchedCarbs = 0;
    let matchedFats = 0;
    let matchCount = 0;

    macroDatabase.forEach(item => {
      const match = item.keywords.some(kw => norm.includes(kw));
      if (match) {
        matchedCalories += item.c;
        matchedProtein += item.p;
        matchedCarbs += item.car;
        matchedFats += item.f;
        matchCount++;
      }
    });

    if (matchCount > 0) {
      setCalories(String(matchedCalories * quantity));
      setProtein(String(matchedProtein * quantity));
      setCarbs(String(matchedCarbs * quantity));
      setFats(String(matchedFats * quantity));
      setAutoPredicted(true);
    } else {
      setAutoPredicted(false);
    }
  }, [foodItem]);

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    await addLog('nutrition', {
      mealCategory: category,
      foodItem,
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fats: parseInt(fats, 10) || 0,
      timestamp: new Date()
    });
    setFoodItem('');
    setAutoPredicted(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Persistent AI Voice & Text Bar */}
      <AIVoiceBar placeholder="Speak or type e.g. 'Ate 2 plates of idli and sambar', 'Drank 500ml water'..." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Utensils size={28} color="#10b981" className="neon-glow-emerald" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Log Meal & Hydration</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Auto-macro estimation & water logging</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Food / Dish Name</label>
                {autoPredicted && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                    <Sparkles size={12} /> Auto-Predicted Macros
                  </span>
                )}
              </div>
              <input 
                type="text" 
                placeholder="e.g. '2 Eggs', 'Idli Sambar', 'Chicken Breast', 'Rice'" 
                value={foodItem} 
                onChange={e => setFoodItem(e.target.value)} 
                className="input-field" 
                style={{ paddingLeft: '1rem' }} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(12, 15, 32, 0.9)' }}>
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

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', backgroundColor: '#10b981' }}>
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
    </div>
  );
}
