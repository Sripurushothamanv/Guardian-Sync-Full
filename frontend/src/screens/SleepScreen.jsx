import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Moon, Sparkles, AlertCircle, Check, Loader2, Calendar } from 'lucide-react';

export default function SleepScreen() {
  const { addLog, addAILog, confirmAILog, logs } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual Log Fields
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState('Good');
  const [wakeUps, setWakeUps] = useState(0);
  
  // AI NLP Fields
  const [aiText, setAiText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  
  // Statuses
  const [success, setSuccess] = useState(false);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    
    // Back-calculate start time from duration (hours)
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
    
    await addLog('sleep', {
      startTime,
      endTime,
      quality,
      wakeUps
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
    
    if (result && result.sleep) {
      setParsedResult(result);
    } else {
      alert('Could not extract sleep data from this phrase. Try: "I slept 6.5 hours and woke up once."');
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

  // Build the sleep history chart
  const recentSleepLogs = [...logs.sleep].slice(0, 7).reverse();
  const maxHours = Math.max(8, ...recentSleepLogs.map(l => l.duration || 0));
  
  const chartHeight = 120;
  const chartWidth = 320;
  const padding = 20;

  // Generate SVG coordinate points
  const points = recentSleepLogs.map((log, index) => {
    const x = padding + (index / Math.max(1, recentSleepLogs.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((log.duration || 0) / maxHours) * (chartHeight - padding * 2);
    return { x, y, duration: log.duration, date: new Date(log.endTime).toLocaleDateString([], { weekday: 'short' }) };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="sleep-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Moon size={24} />
          </div>
          <div>
            <h2>Sleep & Recovery Logs</h2>
            <p>Log sleep hours and quality to track circadian recovery and debt.</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="toast-success glass-panel">
          <Check size={18} color="var(--color-safe)" />
          <span>Sleep logged successfully! Fatigue score updated.</span>
        </div>
      )}

      <div className="screen-content-split">
        {/* Dual Input Section */}
        <div className="input-side glass-panel">
          {/* Tabs */}
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
                  <label className="slider-label">
                    <span>Sleep Duration</span>
                    <strong>{hours} hrs</strong>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="14" 
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(parseFloat(e.target.value))}
                    className="slider-input" 
                  />
                  <div className="slider-limits">
                    <span>1 hr</span>
                    <span>8 hrs (Optimal)</span>
                    <span>14 hrs</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Sleep Quality Rating</label>
                  <div className="quality-rating-grid">
                    {['Poor', 'Fair', 'Good', 'Excellent'].map(q => (
                      <button
                        key={q}
                        type="button"
                        className={`quality-btn ${quality === q ? 'active' : ''}`}
                        onClick={() => setQuality(q)}
                      >
                        {q === 'Poor' && '😢'}
                        {q === 'Fair' && '😐'}
                        {q === 'Good' && '😊'}
                        {q === 'Excellent' && '🤩'}
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Sleep Interruptions</label>
                  <div className="stepper-input">
                    <button type="button" onClick={() => setWakeUps(Math.max(0, wakeUps - 1))}>-</button>
                    <span>{wakeUps} wake-ups</span>
                    <button type="button" onClick={() => setWakeUps(wakeUps + 1)}>+</button>
                  </div>
                </div>

                <button type="submit" className="btn-primary form-submit-btn">
                  Log Sleep Session
                </button>
              </form>
            ) : (
              <div className="ai-entry-area">
                <form onSubmit={handleAIParsing} className="ai-form">
                  <label>Describe your sleep in natural language:</label>
                  <textarea
                    placeholder="e.g. I slept 6.5 hours last night, woke up twice but felt fair this morning."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="input-field textarea-field"
                    rows="3"
                  />
                  <button type="submit" className="btn-primary ai-submit-btn" disabled={parsing}>
                    {parsing ? <Loader2 size={16} className="spin-slow" /> : <Sparkles size={16} />}
                    Parse with AI
                  </button>
                </form>

                {parsedResult && parsedResult.sleep && (
                  <div className="ai-confirmation-modal glass-card">
                    <h4>🤖 AI Extracted Details</h4>
                    <p>Review the extracted values before saving:</p>
                    <div className="confirmation-items">
                      <div className="confirm-item">
                        <span>Duration</span>
                        <strong>{parsedResult.sleep.duration} hrs</strong>
                      </div>
                      <div className="confirm-item">
                        <span>Quality</span>
                        <strong>{parsedResult.sleep.quality}</strong>
                      </div>
                      <div className="confirm-item">
                        <span>Interruptions</span>
                        <strong>{parsedResult.sleep.wakeUps} times</strong>
                      </div>
                    </div>
                    <div className="confirm-actions">
                      <button className="btn-secondary" onClick={() => setParsedResult(null)}>Cancel</button>
                      <button className="btn-primary" onClick={handleAIConfirm}>Confirm & Save</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts & Trends Section */}
        <div className="chart-side glass-panel">
          <h3>Sleep Trend & Analysis</h3>
          <p>Recent sleep sessions logged over the past 7 days.</p>

          <div className="weekly-sleep-chart-container">
            {recentSleepLogs.length > 0 ? (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
                {/* Horizontal grid lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.03)" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.03)" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.08)" />

                {/* Path line */}
                <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />

                {/* Dot overlays */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#8b5cf6" stroke="white" strokeWidth="1.5" />
                    <text x={p.x} y={chartHeight - 4} fontSize="8" fill="var(--text-secondary)" textAnchor="middle">
                      {p.date}
                    </text>
                    <text x={p.x} y={p.y - 8} fontSize="9" fontWeight="700" fill="white" textAnchor="middle">
                      {p.duration}h
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="no-chart-data glass-card">
                <Calendar size={24} color="var(--text-muted)" />
                <p>No sleep logs recorded this week. Log sleep to populate charts.</p>
              </div>
            )}
          </div>

          <div className="sleep-insights-list">
            <div className="insight-row glass-card">
              <span className="bullet purple"></span>
              <div>
                <strong>Circadian Alignment</strong>
                <p>Consistent sleep times lower fatigue score prediction models.</p>
              </div>
            </div>
            <div className="insight-row glass-card">
              <span className="bullet yellow"></span>
              <div>
                <strong>Interruption Penalty</strong>
                <p>Multiple wake-ups degrade the sleep recovery factor multiplier.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sleep-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .screen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title-area {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .icon-badge {
          width: 50px;
          height: 50px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .title-area h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }
        .title-area p {
          color: var(--text-secondary);
          font-size: 0.88rem;
        }
        .toast-success {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-color: rgba(16, 185, 129, 0.2);
          background: rgba(16, 185, 129, 0.05);
          color: #34d399;
          font-size: 0.88rem;
        }
        
        .screen-content-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
        }

        .input-side {
          display: flex;
          flex-direction: column;
        }
        .tab-header {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 1rem;
          font-family: var(--font-main);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-smooth);
          border-bottom: 2px solid transparent;
        }
        .tab-btn.active {
          color: white;
          border-bottom-color: var(--color-primary);
        }
        .tab-body {
          padding: 1.5rem;
          flex: 1;
        }

        .manual-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .slider-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .slider-input {
          width: 100%;
          accent-color: var(--color-primary);
          height: 6px;
          border-radius: 5px;
          cursor: pointer;
        }
        .slider-limits {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .quality-rating-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .quality-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          padding: 0.75rem 0.5rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-main);
          transition: var(--transition-smooth);
        }
        .quality-btn.active {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--color-primary);
          color: white;
        }
        .stepper-input {
          display: flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          width: 100%;
          justify-content: space-between;
          background: rgba(10, 14, 30, 0.6);
        }
        .stepper-input button {
          background: rgba(255,255,255,0.03);
          border: none;
          color: white;
          width: 50px;
          height: 40px;
          cursor: pointer;
          font-size: 1.25rem;
          transition: var(--transition-smooth);
        }
        .stepper-input button:hover {
          background: rgba(255,255,255,0.08);
        }
        .stepper-input span {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .form-submit-btn {
          width: 100%;
          justify-content: center;
          margin-top: 0.5rem;
        }

        .ai-entry-area {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .ai-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ai-form label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .textarea-field {
          resize: none;
        }
        .ai-submit-btn {
          align-self: flex-start;
        }
        .ai-confirmation-modal {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border: 1px solid rgba(6, 182, 212, 0.2);
          background: rgba(6, 182, 212, 0.02);
        }
        .ai-confirmation-modal h4 {
          font-size: 0.95rem;
          color: white;
        }
        .ai-confirmation-modal p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .confirmation-items {
          display: flex;
          gap: 1rem;
        }
        .confirm-item {
          flex: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--border-radius-md);
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          font-size: 0.78rem;
        }
        .confirm-item span {
          color: var(--text-secondary);
          font-size: 0.7rem;
        }
        .confirm-item strong {
          color: white;
          font-size: 0.88rem;
          margin-top: 0.1rem;
        }
        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .confirm-actions button {
          font-size: 0.8rem;
          padding: 0.5rem 1rem !important;
        }

        .chart-side {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .chart-side h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .chart-side p {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .weekly-sleep-chart-container {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 14, 30, 0.3);
          border-radius: var(--border-radius-md);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 0.5rem;
        }
        .svg-chart {
          width: 100%;
          height: 100%;
        }
        .no-chart-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          gap: 0.5rem;
        }
        .no-chart-data p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .sleep-insights-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .insight-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem !important;
        }
        .bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 0.3rem;
          flex-shrink: 0;
        }
        .bullet.purple { background-color: var(--color-primary); box-shadow: 0 0 5px var(--color-primary); }
        .bullet.yellow { background-color: var(--color-caution); box-shadow: 0 0 5px var(--color-caution); }
        .insight-row div strong {
          font-size: 0.82rem;
          color: white;
        }
        .insight-row div p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
          line-height: 1.3;
        }

        @media (max-width: 768px) {
          .screen-content-split {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
