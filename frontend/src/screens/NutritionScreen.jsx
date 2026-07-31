import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Apple, Sparkles, Check, Loader2, Utensils, AlertCircle } from 'lucide-react';

export default function NutritionScreen() {
  const { addLog, addAILog, confirmAILog, logs } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual Log Fields
  const [foodItem, setFoodItem] = useState('');
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [calories, setCalories] = useState(350);
  const [protein, setProtein] = useState(15);
  const [carbs, setCarbs] = useState(40);
  const [fats, setFats] = useState(10);
  
  // AI NLP Fields
  const [aiText, setAiText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  
  // Statuses
  const [success, setSuccess] = useState(false);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!foodItem) return;
    setSuccess(false);

    await addLog('nutrition', {
      mealCategory,
      foodItem,
      calories,
      protein,
      carbs,
      fats
    });

    setFoodItem('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAIParsing = async (e) => {
    e.preventDefault();
    if (!aiText) return;
    setParsing(true);
    setParsedResult(null);

    const result = await addAILog(aiText);
    setParsing(false);
    
    if (result && result.nutrition && result.nutrition.length > 0) {
      setParsedResult(result);
    } else {
      alert('Could not extract food item. Try: "I ate sambar rice and a banana for lunch."');
    }
  };

  const handleAIConfirm = async () => {
    if (!parsedResult) return;
    setParsing(true);
    await confirmAILog(parsedResult);
    setParsing(false);
    setParsedResult(null);
    setAiText('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Compute daily totals
  const todayStr = new Date().toDateString();
  const todayMeals = logs.nutrition.filter(n => new Date(n.timestamp || n.createdAt).toDateString() === todayStr);
  const totalCal = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProt = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFats = todayMeals.reduce((sum, m) => sum + (m.fats || 0), 0);

  const calTarget = 2500;
  const calPercent = Math.min(100, Math.round((totalCal / calTarget) * 100));

  return (
    <div className="nutrition-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Apple size={24} />
          </div>
          <div>
            <h2>Nutrition & Macro Tracker</h2>
            <p>Log meals and track macro levels to combat fatigue and dehydration.</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="toast-success glass-panel" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
          <Check size={18} color="var(--color-safe)" />
          <span>Meal logged successfully! Macros updated.</span>
        </div>
      )}

      <div className="screen-content-split">
        {/* Input Side */}
        <div className="input-side glass-panel">
          <div className="tab-header">
            <button 
              className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => { setActiveTab('manual'); setParsedResult(null); }}
            >
              ✍️ Manual Entry
            </button>
            <button 
              className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 AI Chat Entry
            </button>
          </div>

          <div className="tab-body">
            {activeTab === 'manual' ? (
              <form onSubmit={handleManualSubmit} className="manual-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Meal Category</label>
                    <select 
                      value={mealCategory}
                      onChange={(e) => setMealCategory(e.target.value)}
                      className="input-field"
                      style={{ background: '#0a0e1e' }}
                    >
                      <option value="Breakfast">🍳 Breakfast</option>
                      <option value="Lunch">🍲 Lunch</option>
                      <option value="Dinner">🍽️ Dinner</option>
                      <option value="Snack">🍌 Snack</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Food Item Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sambar Rice with chicken breast" 
                      value={foodItem}
                      onChange={(e) => setFoodItem(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="slider-label">
                    <span>Calories</span>
                    <strong>{calories} kcal</strong>
                  </label>
                  <input 
                    type="range" min="50" max="1500" step="10"
                    value={calories}
                    onChange={(e) => setCalories(parseInt(e.target.value))}
                    className="slider-input" 
                  />
                </div>

                <div className="form-group-grid-3">
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input 
                      type="number" value={protein}
                      onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                      className="input-field" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input 
                      type="number" value={carbs}
                      onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                      className="input-field" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Fats (g)</label>
                    <input 
                      type="number" value={fats}
                      onChange={(e) => setFats(parseInt(e.target.value) || 0)}
                      className="input-field" 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary form-submit-btn" style={{ background: 'linear-gradient(135deg, var(--color-safe), #059669)' }}>
                  Log Manual Meal
                </button>
              </form>
            ) : (
              <div className="ai-entry-area">
                <form onSubmit={handleAIParsing} className="ai-form">
                  <label>Describe your meal in natural language (AI supports Indian dishes):</label>
                  <textarea
                    placeholder="e.g. I ate 2 chapatis, chicken curry, and a banana for lunch."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="input-field textarea-field"
                    rows="3"
                  />
                  <button type="submit" className="btn-primary ai-submit-btn" style={{ background: 'linear-gradient(135deg, var(--color-safe), #059669)' }} disabled={parsing}>
                    {parsing ? <Loader2 size={16} className="spin-slow" /> : <Sparkles size={16} />}
                    Parse Meal with AI
                  </button>
                </form>

                {parsedResult && parsedResult.nutrition && parsedResult.nutrition.length > 0 && (
                  <div className="ai-confirmation-modal glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <h4>🤖 AI Extracted Meal Details</h4>
                    <p>Confirm the estimated nutritional values calculated by AI:</p>
                    
                    <div className="ai-confirmation-list">
                      {parsedResult.nutrition.map((item, idx) => (
                        <div key={idx} className="confirm-meal-item glass-card">
                          <div className="meal-title-row">
                            <strong>{item.foodItem}</strong>
                            <span>{item.mealCategory}</span>
                          </div>
                          <div className="confirm-meal-macros">
                            <span>🔥 {item.calories} kcal</span>
                            <span>🥩 P: {item.protein}g</span>
                            <span>🍚 C: {item.carbs}g</span>
                            <span>🥑 F: {item.fats}g</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="confirm-actions">
                      <button className="btn-secondary" onClick={() => setParsedResult(null)}>Cancel</button>
                      <button className="btn-primary" style={{ background: 'var(--color-safe)' }} onClick={handleAIConfirm}>Confirm & Save</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Daily Progress side */}
        <div className="chart-side glass-panel">
          <h3>Daily Nutrition Progress</h3>
          <p>Logged macros relative to standard healthy thresholds.</p>

          <div className="macro-progress-summary">
            {/* Calories circular ring card */}
            <div className="calorie-ring-box glass-card">
              <div className="ring-header">
                <strong>Daily Calories</strong>
                <span>{totalCal} / {calTarget} kcal</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${calPercent}%`, backgroundColor: 'var(--color-safe)' }}></div>
              </div>
              <span className="ring-footer">{calPercent}% of daily allowance</span>
            </div>

            {/* Protein, Carbs, Fats progress bars */}
            <div className="macro-bars-card glass-card">
              <div className="bar-row">
                <div className="bar-labels">
                  <span>Protein</span>
                  <strong>{totalProt}g / 100g</strong>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((totalProt/100)*100))}%`, backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-labels">
                  <span>Carbohydrates</span>
                  <strong>{totalCarbs}g / 300g</strong>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((totalCarbs/300)*100))}%`, backgroundColor: '#8b5cf6' }}></div>
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-labels">
                  <span>Fats</span>
                  <strong>{totalFats}g / 80g</strong>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((totalFats/80)*100))}%`, backgroundColor: '#06b6d4' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .nutrition-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .form-group-row {
          display: flex;
          gap: 1rem;
        }
        .form-group-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .macro-progress-summary {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 0.5rem;
        }
        .calorie-ring-box {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.25rem !important;
        }
        .ring-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .ring-header strong {
          color: white;
        }
        .ring-header span {
          color: var(--text-secondary);
        }
        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 5px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.5s ease;
        }
        .ring-footer {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .macro-bars-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem !important;
        }
        .bar-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .bar-labels strong {
          color: white;
        }
        .ai-confirmation-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 0.5rem;
        }
        .confirm-meal-item {
          padding: 0.75rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .meal-title-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .meal-title-row strong {
          color: white;
        }
        .meal-title-row span {
          font-size: 0.7rem;
          color: var(--color-safe);
          background: rgba(16, 185, 129, 0.1);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .confirm-meal-macros {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
