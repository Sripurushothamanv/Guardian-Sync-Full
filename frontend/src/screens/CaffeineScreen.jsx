import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Coffee, Sparkles, Check, Loader2, Info, AlertTriangle } from 'lucide-react';

export default function CaffeineScreen() {
  const { addLog, addAILog, confirmAILog, dashboardData } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual Log Fields
  const [beverage, setBeverage] = useState('Filter Coffee');
  const [count, setCount] = useState(1);
  const [timestamp, setTimestamp] = useState(new Date().toISOString().substring(0, 16));
  
  // AI NLP Fields
  const [aiText, setAiText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  
  // Statuses
  const [success, setSuccess] = useState(false);

  const beverages = [
    { name: 'Filter Coffee', mg: 95, icon: '☕', description: 'Standard drip coffee' },
    { name: 'Espresso', mg: 75, icon: '☕', description: 'Single shot espresso' },
    { name: 'Energy Drink', mg: 80, icon: '🥤', description: 'Standard can' },
    { name: 'Tea', mg: 30, icon: '🍵', description: 'Green/Black tea cup' }
  ];

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    const bev = beverages.find(b => b.name === beverage);
    const mgAmount = bev ? bev.mg * count : 95 * count;

    await addLog('caffeine', {
      beverage,
      mgAmount,
      timestamp: new Date(timestamp)
    });

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
    
    if (result && result.caffeine) {
      setParsedResult(result);
    } else {
      alert('Could not extract caffeine data. Try: "I had 2 espressos today."');
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

  // Safe window and cutoffs helper
  const activeCaffeine = dashboardData.activeCaffeine;
  const isOverlimit = activeCaffeine > 400;

  // Let's compute a cutoff time: standard curfew is 8 hours before typical bedtime
  // Say, typical bedtime is 10:00 PM. Cutoff is 2:00 PM.
  const currentHour = new Date().getHours();
  const isAfterCutoff = currentHour >= 14 && currentHour < 22; // 2PM to 10PM

  return (
    <div className="caffeine-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Coffee size={24} />
          </div>
          <div>
            <h2>Caffeine Tracker & Calculator</h2>
            <p>Log caffeine intake to optimize circadian rhythm disruptions.</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="toast-success glass-panel" style={{ borderColor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
          <Check size={18} color="var(--color-secondary)" />
          <span>Caffeine intake logged! System decay rate applied.</span>
        </div>
      )}

      {isOverlimit && (
        <div className="toast-alert danger-glow-pulse glass-panel">
          <AlertTriangle size={18} color="var(--color-danger)" />
          <span>Caffeine saturation high ({activeCaffeine}mg). Sleep quality will be degraded. Drink water immediately.</span>
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
                <div className="form-group">
                  <label>Select Beverage</label>
                  <div className="beverage-select-grid">
                    {beverages.map(bev => (
                      <button
                        key={bev.name}
                        type="button"
                        className={`beverage-card glass-card ${beverage === bev.name ? 'active' : ''}`}
                        onClick={() => setBeverage(bev.name)}
                      >
                        <span className="bev-emoji">{bev.icon}</span>
                        <div className="bev-info">
                          <strong>{bev.name}</strong>
                          <span>~{bev.mg}mg per serving</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="slider-label">
                    <span>Number of Servings</span>
                    <strong>{count} {count === 1 ? 'cup' : 'cups'}</strong>
                  </label>
                  <div className="stepper-input">
                    <button type="button" onClick={() => setCount(Math.max(1, count - 1))}>-</button>
                    <span>{count} servings</span>
                    <button type="button" onClick={() => setCount(count + 1)}>+</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Date & Time Logged</label>
                  <input 
                    type="datetime-local" 
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="input-field" 
                    required
                  />
                </div>

                <button type="submit" className="btn-primary form-submit-btn" style={{ background: 'linear-gradient(135deg, var(--color-secondary), #0891b2)' }}>
                  Log Caffeine Intake
                </button>
              </form>
            ) : (
              <div className="ai-entry-area">
                <form onSubmit={handleAIParsing} className="ai-form">
                  <label>Describe your caffeine intake in natural language:</label>
                  <textarea
                    placeholder="e.g. I drank 2 espressos at 1 PM today."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="input-field textarea-field"
                    rows="3"
                  />
                  <button type="submit" className="btn-primary ai-submit-btn" style={{ background: 'linear-gradient(135deg, var(--color-secondary), #0891b2)' }} disabled={parsing}>
                    {parsing ? <Loader2 size={16} className="spin-slow" /> : <Sparkles size={16} />}
                    Parse Intake with AI
                  </button>
                </form>

                {parsedResult && parsedResult.caffeine && (
                  <div className="ai-confirmation-modal glass-card" style={{ borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                    <h4>🤖 AI Extracted Details</h4>
                    <p>Review values before saving:</p>
                    <div className="confirmation-items">
                      <div className="confirm-item">
                        <span>Beverage Type</span>
                        <strong>{parsedResult.caffeine.beverage}</strong>
                      </div>
                      <div className="confirm-item">
                        <span>Servings Count</span>
                        <strong>{parsedResult.caffeine.count} serving(s)</strong>
                      </div>
                      <div className="confirm-item">
                        <span>Estimated Content</span>
                        <strong>{parsedResult.caffeine.mgAmount} mg</strong>
                      </div>
                    </div>
                    <div className="confirm-actions">
                      <button className="btn-secondary" onClick={() => setParsedResult(null)}>Cancel</button>
                      <button className="btn-primary" style={{ background: 'var(--color-secondary)' }} onClick={handleAIConfirm}>Confirm & Save</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Calculations and Cutoff Panel */}
        <div className="chart-side glass-panel">
          <h3>Calculators & Cutoffs</h3>
          <p>Circadian analytics for safe driving and restful sleep.</p>

          <div className="caffeine-stats-panel">
            <div className="stat-circle-card glass-card">
              <span className="stat-label">Active System Caffeine</span>
              <span className="stat-value" style={{ color: isOverlimit ? 'var(--color-danger)' : 'var(--color-secondary)' }}>
                {activeCaffeine} <span>mg</span>
              </span>
              <span className="stat-desc">Limit recommendation: 400mg</span>
            </div>

            {/* Next Safe Window indicator */}
            <div className="stat-box-row glass-card">
              <div className="box-title">
                <Info size={16} color="var(--color-secondary)" />
                <strong>Next Coffee Window</strong>
              </div>
              <p>
                {activeCaffeine < 150 
                  ? 'Ready: System caffeine levels are low. Safe to consume coffee.'
                  : `Wait: Please allow ~${Math.ceil((Math.log(activeCaffeine / 150) / 0.1386))} hours for levels to decay below 150mg.`}
              </p>
            </div>

            {/* Curfew cutoffs */}
            <div className={`stat-box-row glass-card ${isAfterCutoff ? 'caution-border' : ''}`}>
              <div className="box-title">
                <AlertTriangle size={16} color={isAfterCutoff ? 'var(--color-caution)' : 'var(--color-safe)'} />
                <strong>Circadian Cutoff (Curfew)</strong>
              </div>
              <p>
                {isAfterCutoff 
                  ? 'CRITICAL CURFEW REACHED: Consuming caffeine now will interrupt slow-wave deep sleep cycles tonight.'
                  : 'SAFE ZONE: Caffeine intake is fine for now, but stop 8 hours before sleeping.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .caffeine-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .toast-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-width: 1px;
          background: rgba(239, 68, 68, 0.06);
          color: #f87171;
          font-size: 0.88rem;
        }
        .beverage-select-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .beverage-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1rem !important;
        }
        .beverage-card.active {
          border-color: var(--color-secondary);
          background: rgba(6, 182, 212, 0.1);
        }
        .bev-emoji {
          font-size: 1.5rem;
        }
        .bev-info {
          display: flex;
          flex-direction: column;
        }
        .bev-info strong {
          font-size: 0.88rem;
          color: white;
        }
        .bev-info span {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
        }
        .caffeine-stats-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .stat-circle-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem !important;
          text-align: center;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 2.2rem;
          font-weight: 800;
          margin: 0.5rem 0;
        }
        .stat-value span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .stat-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .stat-box-row {
          padding: 1rem !important;
        }
        .box-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }
        .box-title strong {
          font-size: 0.85rem;
          color: white;
        }
        .stat-box-row p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .caution-border {
          border-color: rgba(245, 158, 11, 0.3) !important;
          background: rgba(245, 158, 11, 0.03);
        }
        @media (max-width: 576px) {
          .beverage-select-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
