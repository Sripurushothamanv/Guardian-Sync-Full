import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Clock, Calendar, Sparkles, Zap, AlignLeft } from 'lucide-react';

export default function ShiftScreen() {
  const { addLog, logs, dashboardData } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  const [shiftType, setShiftType] = useState('Day Shift (+10 pts)');
  const [restInterval, setRestInterval] = useState('30 Minutes');
  const [startTime, setStartTime] = useState('2026-08-05 09:38');
  const [endTime, setEndTime] = useState('2026-08-05 17:38');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await addLog('shift', {
      shiftType,
      restInterval,
      startTime,
      endTime,
      duration: 8,
      notes
    });

    setNotes('');
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Tabs Header matching Page 12 */}
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
          <Sparkles size={16} color="#ff9f43" />
          <span>🤖 AI Parser</span>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Selected Duty Banner matching Page 12 */}
            <div className="glass-card" style={{ 
              padding: '1.25rem', 
              borderColor: 'rgba(255, 159, 67, 0.4)', 
              backgroundColor: 'rgba(255, 159, 67, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              borderRadius: '0.75rem'
            }}>
              <Zap size={22} color="#ff9f43" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#ffffff' }}>
                  Selected: Day Duty Shift
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#ff9f43', fontWeight: '700' }}>
                  +10 Fatigue Impact Points
                </span>
              </div>
            </div>

            {/* Shift Type Dropdown matching Page 12 */}
            <select 
              value={shiftType} 
              onChange={e => setShiftType(e.target.value)} 
              className="input-field" 
              style={{ backgroundColor: '#161C36' }}
            >
              <option value="Day Shift (+10 pts)">☀️ Day Shift (+10 pts)</option>
              <option value="Night Shift (+30 pts)">🦇 Night Shift (+30 pts)</option>
              <option value="On-Call Shift (+25 pts)">🩺 On-Call Shift (+25 pts)</option>
              <option value="Rotating Shift (+20 pts)">🔄 Rotating Shift (+20 pts)</option>
            </select>

            {/* Rest Interval Dropdown matching Page 12 */}
            <select 
              value={restInterval} 
              onChange={e => setRestInterval(e.target.value)} 
              className="input-field" 
              style={{ backgroundColor: '#161C36' }}
            >
              <option value="30 Minutes">30 Minutes Rest</option>
              <option value="45 Minutes">45 Minutes Rest</option>
              <option value="60 Minutes">60 Minutes Rest</option>
              <option value="No Break">No Break Taken (+5 Burden)</option>
            </select>

            {/* Start Time Picker Card matching Page 12 */}
            <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={20} color="#ff9f43" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Start Time</span>
                <input 
                  type="text" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', outline: 'none', width: '100%' }}
                />
              </div>
            </div>

            {/* End Time Picker Card matching Page 12 */}
            <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={20} color="#ff9f43" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>End Time</span>
                <input 
                  type="text" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', outline: 'none', width: '100%' }}
                />
              </div>
            </div>

            {/* Notes Input Field matching Page 12 */}
            <div className="input-with-icon">
              <AlignLeft size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Notes" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="input-field" 
              />
            </div>

            {/* Primary Orange Button matching Page 12 */}
            <button 
              type="submit" 
              className="btn-orange" 
              style={{ padding: '0.9rem', fontSize: '1rem', borderRadius: '0.65rem' }} 
              disabled={loading}
            >
              {loading ? 'Logging Shift...' : 'Log Shift'}
            </button>
          </form>

          {/* Side History */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#ffffff' }}>
              Shift History Log
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {logs.shift && logs.shift.length > 0 ? (
                logs.shift.map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>{s.shiftType}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Rest: {s.restInterval || '30 Mins'}</span>
                    </div>
                    <span style={{ fontWeight: '800', color: '#ff9f43' }}>Logged</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No shift logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <Sparkles size={32} color="#ff9f43" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Shift Parser</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Dictate or type e.g. "Worked 8 hour day shift in ICU" using the top <strong>+ AI Log</strong> button.
          </p>
        </div>
      )}
    </div>
  );
}
