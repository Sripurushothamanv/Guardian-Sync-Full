import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Utensils, Droplets, Sparkles } from 'lucide-react';

export default function NutritionScreen() {
  const { addLog, logs, dashboardData, logHydration } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  const [foodItem, setFoodItem] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [calories, setCalories] = useState(120);
  const [protein, setProtein] = useState(3);
  const [carbs, setCarbs] = useState(22);
  const [fats, setFats] = useState(4);
  const [exactWater, setExactWater] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addLog('nutrition', {
      mealCategory: mealType,
      foodItem: foodItem || 'Meal',
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      timestamp: new Date()
    });
    setFoodItem('');
    setLoading(false);
  };

  const handleLogHydration = async () => {
    const ml = parseInt(exactWater, 10);
    if (!ml || ml <= 0) return;
    await logHydration(ml);
    setExactWater('');
  };

  const currentWater = dashboardData?.waterIntake || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Tabs Header matching Page 11 */}
      <div className="tabs-header" style={{ justifyContent: 'center' }}>
        <button 
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <span>✍️ Manual Log</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={16} color="#00b894" />
          <span>🤖 AI Parser</span>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <form onSubmit={handleMealSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Food Item Description input matching Page 11 */}
            <div className="input-with-icon">
              <Utensils size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Food Item Description (e.g. Plain Oats, Omelette...)" 
                value={foodItem}
                onChange={e => setFoodItem(e.target.value)}
                className="input-field" 
              />
            </div>

            {/* Meal Type Dropdown matching Page 11 */}
            <select 
              value={mealType} 
              onChange={e => setMealType(e.target.value)} 
              className="input-field" 
              style={{ backgroundColor: '#161C36' }}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>

            {/* Calories Slider matching Page 11 */}
            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>Calories</span>
                <strong style={{ fontSize: '1rem', color: '#00b894' }}>{calories} kcal</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1500" 
                step="10" 
                value={calories} 
                onChange={e => setCalories(Number(e.target.value))}
                style={{ accentColor: '#00b894' }}
              />
            </div>

            {/* Macro Input Cards matching Page 11 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
              <div className="glass-card" style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.35rem' }}>Protein (g)</label>
                <input 
                  type="number" 
                  value={protein} 
                  onChange={e => setProtein(Number(e.target.value))} 
                  className="input-field" 
                  style={{ textAlign: 'center', padding: '0.35rem' }} 
                />
              </div>

              <div className="glass-card" style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.35rem' }}>Carbs (g)</label>
                <input 
                  type="number" 
                  value={carbs} 
                  onChange={e => setCarbs(Number(e.target.value))} 
                  className="input-field" 
                  style={{ textAlign: 'center', padding: '0.35rem' }} 
                />
              </div>

              <div className="glass-card" style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.35rem' }}>Fats (g)</label>
                <input 
                  type="number" 
                  value={fats} 
                  onChange={e => setFats(Number(e.target.value))} 
                  className="input-field" 
                  style={{ textAlign: 'center', padding: '0.35rem' }} 
                />
              </div>
            </div>

            {/* Primary Teal Button matching Page 11 */}
            <button 
              type="submit" 
              className="btn-teal" 
              style={{ padding: '0.9rem', fontSize: '1rem', borderRadius: '0.65rem' }} 
              disabled={loading}
            >
              {loading ? 'Logging Meal...' : 'Log Meal'}
            </button>

            {/* Log Hydration Intake Section matching Page 11 */}
            <div className="glass-card" style={{ padding: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#ffffff' }}>
                  <Droplets size={18} color="#00bcd4" /> Log Hydration Intake
                </div>
                <strong style={{ color: '#00bcd4', fontSize: '0.95rem' }}>{currentWater} / 3000 ml</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="number" 
                  placeholder="Enter exact ml ..." 
                  value={exactWater} 
                  onChange={e => setExactWater(e.target.value)} 
                  className="input-field" 
                  style={{ paddingLeft: '1rem' }} 
                />
                <button 
                  type="button" 
                  onClick={handleLogHydration} 
                  className="btn-teal" 
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  Add / Log
                </button>
              </div>
            </div>
          </form>

          {/* Side Today Summary matching Page 11 */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#ffffff' }}>
              Today Summary
            </h2>

            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.35rem' }}>Calories</span>
              <strong style={{ fontSize: '1.5rem', fontWeight: '800', color: '#00b894' }}>0 / 2500 kcal</strong>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                Protein: 0g | Carbs: 0g | Fats: 0g
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.85rem' }}>Logged Meals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
              {logs.nutrition && logs.nutrition.length > 0 ? (
                logs.nutrition.map((item, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>{item.foodItem}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{item.mealCategory} • P:{item.protein || 0}g C:{item.carbs || 0}g F:{item.fats || 0}g</span>
                    </div>
                    <span style={{ fontWeight: '800', color: '#00b894' }}>{item.calories} kcal</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No meals recorded today.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <Sparkles size={32} color="#00b894" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Meal Parser</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Dictate or type e.g. "Ate chicken breast with rice for lunch" using the top <strong>+ AI Log</strong> button.
          </p>
        </div>
      )}
    </div>
  );
}

