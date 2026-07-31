import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Brain, Sliders, Info, ChevronRight, Activity } from 'lucide-react';

export default function FatigueScreen() {
  const { dashboardData, user, applyFatigueSimulation } = useContext(AppContext);
  const { fatigueScore, fatigueLevel, sleepDebt, activeCaffeine, awakeHours } = dashboardData;

  // Simulator States
  const [simSleepDebt, setSimSleepDebt] = useState(sleepDebt);
  const [simAwakeHours, setSimAwakeHours] = useState(awakeHours);
  const [simShiftType, setSimShiftType] = useState('Night');
  const [simCaffeine, setSimCaffeine] = useState(150); // in mg

  // Calculate simulated fatigue
  // Formula: F = min(100, max(0, (SD * 3) + (AD * 1.5) + SI - CA))
  const calculateSimulatedFatigue = () => {
    let si = 0;
    if (simShiftType === 'Night') si = 30;
    else if (simShiftType === 'On-Call') si = 25;
    else if (simShiftType === 'Rotating') si = 20;
    else if (simShiftType === 'Day') si = 10;

    const ca = simCaffeine * 0.15;
    const score = (simSleepDebt * 3) + (simAwakeHours * 1.5) + si - ca;
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const simScore = calculateSimulatedFatigue();
  let simLevel = 'Low';
  let simColor = '#10b981';
  if (simScore >= 80) { simLevel = 'Critical'; simColor = '#ef4444'; }
  else if (simScore >= 60) { simLevel = 'High'; simColor = '#f59e0b'; }
  else if (simScore >= 40) { simLevel = 'Moderate'; simColor = '#fbbf24'; }

  // Variables breakdown for current score
  const sdWeight = sleepDebt * 3;
  const ahWeight = awakeHours * 1.5;
  let siWeight = 0;
  if (dashboardData.activeShift) {
    const type = dashboardData.activeShift.type;
    if (type === 'Night') siWeight = 30;
    else if (type === 'On-Call') siWeight = 25;
    else if (type === 'Rotating') siWeight = 20;
    else siWeight = 10;
  }
  const caDeduction = activeCaffeine * 0.15;

  const totalRaw = sdWeight + ahWeight + siWeight;
  const maxBar = Math.max(1, sdWeight, ahWeight, siWeight, caDeduction);

  return (
    <div className="fatigue-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Brain size={24} />
          </div>
          <div>
            <h2>Fatigue Prediction Analytics</h2>
            <p>Deconstruct the mathematical parameters behind your fatigue levels and simulate future scenarios.</p>
          </div>
        </div>
      </header>

      <div className="screen-content-split">
        {/* Left Side: Formula Breakdown */}
        <div className="breakdown-card glass-panel">
          <h3>Heuristic Parameter Breakdown</h3>
          <p className="formula-box">
            Formula: F = min(100, max(0, (Sleep Debt &times; 3) + (Awake Hours &times; 1.5) + Shift Impact - Caffeine Deduction))
          </p>

          <div className="factor-bars-list">
            <div className="factor-row glass-card">
              <div className="factor-title">
                <span>Sleep Debt (x3 multiplier)</span>
                <strong>+{sdWeight.toFixed(1)} fatigue pts</strong>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(sdWeight / maxBar) * 100}%`, backgroundColor: '#8b5cf6' }}></div>
              </div>
              <span className="factor-desc">Accumulated sleep debt: {sleepDebt} hrs (Target: {user ? user.sleepGoal : 8} hrs/day)</span>
            </div>

            <div className="factor-row glass-card">
              <div className="factor-title">
                <span>Awake Duration (x1.5 multiplier)</span>
                <strong>+{ahWeight.toFixed(1)} fatigue pts</strong>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(ahWeight / maxBar) * 100}%`, backgroundColor: '#fbbf24' }}></div>
              </div>
              <span className="factor-desc">{awakeHours} hours since last sleep session concluded</span>
            </div>

            <div className="factor-row glass-card">
              <div className="factor-title">
                <span>Shift Impact Load</span>
                <strong>+{siWeight} fatigue pts</strong>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(siWeight / maxBar) * 100}%`, backgroundColor: '#f59e0b' }}></div>
              </div>
              <span className="factor-desc">Active Shift: {dashboardData.activeShift ? dashboardData.activeShift.type : 'None active'}</span>
            </div>

            <div className="factor-row glass-card" style={{ borderColor: 'rgba(6, 182, 212, 0.15)' }}>
              <div className="factor-title">
                <span style={{ color: 'var(--color-secondary)' }}>Caffeine Reduction (x0.15)</span>
                <strong style={{ color: 'var(--color-secondary)' }}>-{caDeduction.toFixed(1)} fatigue pts</strong>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(caDeduction / maxBar) * 100}%`, backgroundColor: '#06b6d4' }}></div>
              </div>
              <span className="factor-desc">Active decaying system caffeine: {activeCaffeine} mg</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Fatigue Simulator */}
        <div className="simulator-card glass-panel">
          <div className="sim-header">
            <Sliders size={20} color="var(--color-secondary)" />
            <h3>Fatigue Planning Simulator</h3>
          </div>
          <p>Simulate sleep and workload scenarios to preemptively calculate shift preparedness.</p>

          <div className="simulator-gauge glass-card">
            <div className="sim-gauge-text">
              <span className="sim-score-value" style={{ color: simColor, textShadow: `0 0 15px ${simColor}30` }}>{simScore}</span>
              <span className="sim-score-max">/100</span>
              <span className="sim-level-lbl" style={{ backgroundColor: `${simColor}15`, color: simColor }}>
                {simLevel} Risk
              </span>
            </div>
          </div>

          <div className="simulator-controls">
            <div className="form-group">
              <div className="slider-label">
                <span>Simulated Sleep Debt</span>
                <strong>{simSleepDebt} hrs</strong>
              </div>
              <input 
                type="range" min="0" max="15" step="0.5"
                value={simSleepDebt}
                onChange={(e) => setSimSleepDebt(parseFloat(e.target.value))}
                className="slider-input" 
              />
            </div>

            <div className="form-group">
              <div className="slider-label">
                <span>Simulated Hours Awake</span>
                <strong>{simAwakeHours} hrs</strong>
              </div>
              <input 
                type="range" min="1" max="24" step="1"
                value={simAwakeHours}
                onChange={(e) => setSimAwakeHours(parseInt(e.target.value))}
                className="slider-input" 
              />
            </div>

            <div className="form-group">
              <div className="slider-label">
                <span>Simulated Active Shift Type</span>
                <strong>{simShiftType}</strong>
              </div>
              <select
                value={simShiftType}
                onChange={(e) => setSimShiftType(e.target.value)}
                className="input-field"
                style={{ background: '#0a0e1e' }}
              >
                <option value="None">No Shift (0 pts)</option>
                <option value="Day">☀️ Day Shift (+10 pts)</option>
                <option value="Rotating">🔄 Rotating Shift (+20 pts)</option>
                <option value="On-Call">🩺 On-Call Duty (+25 pts)</option>
                <option value="Night">🌙 Night Shift (+30 pts)</option>
              </select>
            </div>

            <div className="form-group">
              <div className="slider-label">
                <span>Simulated Caffeine Intake</span>
                <strong>{simCaffeine} mg</strong>
              </div>
              <input 
                type="range" min="0" max="600" step="25"
                value={simCaffeine}
                onChange={(e) => setSimCaffeine(parseInt(e.target.value))}
                className="slider-input" 
              />
              <div className="slider-limits">
                <span>0 mg</span>
                <span>300 mg (3 coffees)</span>
                <span>600 mg</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
              onClick={() => {
                applyFatigueSimulation({
                  simSleepDebt,
                  simAwakeHours,
                  simCaffeine,
                  simShiftType
                });
                alert('Simulated values saved & applied! Your Dashboard Fatigue Index has been updated.');
              }}
            >
              ⚡ Save & Apply to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .fatigue-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .formula-box {
          font-size: 0.8rem;
          color: var(--color-secondary);
          background: rgba(6, 182, 212, 0.05);
          border: 1px dashed rgba(6, 182, 212, 0.2);
          padding: 0.75rem;
          border-radius: var(--border-radius-md);
          text-align: center;
          margin: 0.5rem 0 1rem;
          line-height: 1.4;
        }
        .factor-bars-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .factor-row {
          padding: 1rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .factor-title {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .factor-title strong {
          font-size: 0.9rem;
          color: white;
        }
        .factor-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .sim-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .sim-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .simulator-gauge {
          padding: 1.5rem !important;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(10, 14, 30, 0.4);
          margin-bottom: 1.25rem;
        }
        .sim-gauge-text {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .sim-score-value {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1;
        }
        .sim-score-max {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .sim-level-lbl {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .simulator-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
      `}</style>
    </div>
  );
}
