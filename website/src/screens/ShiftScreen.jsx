import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Clock, Sparkles, Check, Loader2, Calendar, ShieldAlert } from 'lucide-react';

export default function ShiftScreen() {
  const { addLog, addAILog, confirmAILog, logs } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual Log Fields
  const [shiftType, setShiftType] = useState('Day');
  const [startTime, setStartTime] = useState(new Date().toISOString().substring(0, 16));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 8*3600000).toISOString().substring(0, 16)); // default +8h
  const [breakDuration, setBreakDuration] = useState(30);
  const [notes, setNotes] = useState('');
  
  // AI NLP Fields
  const [aiText, setAiText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  
  // Statuses
  const [success, setSuccess] = useState(false);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    await addLog('shift', {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      shiftType,
      breakDuration,
      notes
    });

    setNotes('');
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
    
    if (result && result.shift) {
      setParsedResult(result);
    } else {
      alert('Could not extract shift data. Try: "Worked a 12h night shift."');
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

  // Shift Statistics
  const shiftLogsList = logs.shift || [];
  const totalShifts = shiftLogsList.length;
  const nightShiftsCount = shiftLogsList.filter(s => s.shiftType === 'Night').length;
  const avgShiftDuration = totalShifts > 0 
    ? (shiftLogsList.reduce((sum, s) => {
        const dur = (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60 * 60);
        return sum + dur;
      }, 0) / totalShifts).toFixed(1)
    : 0;

  return (
    <div className="shift-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <h2>Hospital Shift Roster Logs</h2>
            <p>Log your shift timings to adapt circadian recommendations and calculate active fatigue impact.</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="toast-success glass-panel" style={{ borderColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
          <Check size={18} color="var(--color-caution)" />
          <span>Shift logged successfully! Fatigue algorithms refreshed.</span>
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
                    <label>Shift Type</label>
                    <select 
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value)}
                      className="input-field"
                      style={{ background: '#0a0e1e' }}
                    >
                      <option value="Day">☀️ Day Shift</option>
                      <option value="Night">🌙 Night Shift (+30 Fatigue)</option>
                      <option value="On-Call">🩺 On-Call Duty (+25 Fatigue)</option>
                      <option value="Rotating">🔄 Rotating Shift (+20 Fatigue)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Break Duration</label>
                    <select
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                      className="input-field"
                      style={{ background: '#0a0e1e' }}
                    >
                      <option value="0">No Breaks</option>
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Start Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-field" 
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="input-field" 
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Roster Notes / Handover Details</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Busy ward rotation, multiple codes called" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field"
                  />
                </div>

                <button type="submit" className="btn-primary form-submit-btn" style={{ background: 'linear-gradient(135deg, var(--color-caution), #d97706)' }}>
                  Log Shift Schedule
                </button>
              </form>
            ) : (
              <div className="ai-entry-area">
                <form onSubmit={handleAIParsing} className="ai-form">
                  <label>Describe your shift details in natural language:</label>
                  <textarea
                    placeholder="e.g. I just finished a 14-hour night shift, had a 30-minute break."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="input-field textarea-field"
                    rows="3"
                  />
                  <button type="submit" className="btn-primary ai-submit-btn" style={{ background: 'linear-gradient(135deg, var(--color-caution), #d97706)' }} disabled={parsing}>
                    {parsing ? <Loader2 size={16} className="spin-slow" /> : <Sparkles size={16} />}
                    Parse Shift with AI
                  </button>
                </form>

                {parsedResult && parsedResult.shift && (
                  <div className="ai-confirmation-modal glass-card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    <h4>🤖 AI Extracted Shift Details</h4>
                    <p>Confirm the shift details parsed by AI:</p>
                    <div className="confirmation-items">
                      <div className="confirm-item">
                        <span>Duty Type</span>
                        <strong>{parsedResult.shift.shiftType} Shift</strong>
                      </div>
                      <div className="confirm-item">
                        <span>Duration</span>
                        <strong>{parsedResult.shift.duration} hrs</strong>
                      </div>
                      <div className="confirm-item">
                        <span>Break Time</span>
                        <strong>{parsedResult.shift.breakDuration} mins</strong>
                      </div>
                    </div>
                    <div className="confirm-actions">
                      <button className="btn-secondary" onClick={() => setParsedResult(null)}>Cancel</button>
                      <button className="btn-primary" style={{ background: 'var(--color-caution)' }} onClick={handleAIConfirm}>Confirm & Save</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Analytics details */}
        <div className="chart-side glass-panel">
          <h3>Shift Analytics & Fatigue Loading</h3>
          <p>Impact of shift rosters on your cumulative exhaustion score.</p>

          <div className="shift-stats-grid">
            <div className="stat-box glass-card">
              <span>Total Shifts Logged</span>
              <strong>{totalShifts}</strong>
            </div>
            
            <div className="stat-box glass-card">
              <span>Average Duration</span>
              <strong>{avgShiftDuration} <span style={{ fontSize: '0.85rem' }}>hrs</span></strong>
            </div>

            <div className="stat-box glass-card">
              <span>Night Shifts Ratio</span>
              <strong>{totalShifts > 0 ? Math.round((nightShiftsCount/totalShifts)*100) : 0}%</strong>
              <span className="sub-stat">{nightShiftsCount} out of {totalShifts} duties</span>
            </div>
          </div>

          <div className="adaptation-index glass-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldAlert size={18} color="var(--color-primary)" />
              <strong>Night Shift Adaptations</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Working 3+ consecutive night shifts triggers the **Burnout alert** and applies a 1.2x fatigue score multiplier due to circadian rhythm desynchronization.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .tab-header {
          display: flex;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.25rem;
          border-radius: var(--border-radius-md);
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .tab-btn {
          flex: 1;
          padding: 0.65rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .tab-btn.active {
          background: rgba(139, 92, 246, 0.15);
          color: white;
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }
        .shift-wrapper {
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
        .shift-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem !important;
        }
        .stat-box span {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }
        .stat-box strong {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          margin: 0.25rem 0;
        }
        .sub-stat {
          font-size: 0.65rem;
          color: var(--text-muted) !important;
        }
        .adaptation-index {
          padding: 1rem !important;
        }
        @media (max-width: 576px) {
          .form-group-row {
            flex-direction: column;
            gap: 1.25rem;
          }
          .shift-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
