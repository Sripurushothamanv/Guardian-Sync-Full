import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import AIParser from '../components/AIParser';
import { Moon, Sun, Sparkles, Clock, Calendar } from 'lucide-react';

export default function SleepScreen() {
  const { addLog, logs, dashboardData, setAwakeHours } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  
  const [bedtime, setBedtime] = useState('11:00 PM');
  const [wakeTime, setWakeTime] = useState('06:30 AM');
  const [duration, setDuration] = useState(7.5);
  const [awakeHoursInput, setAwakeHoursInput] = useState(6.0);
  const [quality, setQuality] = useState('Good');
  const [interruptions, setInterruptions] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const end = new Date();
    const start = new Date(end.getTime() - (duration * 3600000));
    
    await addLog('sleep', {
      startTime: start,
      endTime: end,
      duration,
      quality,
      wakeUps: interruptions
    });

    if (awakeHoursInput) {
      setAwakeHours(awakeHoursInput);
    }

    setLoading(false);
  };

  const qualityOptions = ['Poor', 'Fair', 'Good', 'Excellent'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Tabs Header matching Page 8 & 9 */}
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
          <Sparkles size={16} color="#8b5cf6" />
          <span>🤖 AI Parser</span>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Log Bedtime & Wake-Up Schedule matching Page 8 */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
                Log Bedtime & Wake-Up Schedule
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    <Moon size={16} /> Bedtime
                  </div>
                  <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>{bedtime}</strong>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff9f43', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    <Sun size={16} /> Wake-Up Time
                  </div>
                  <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>{wakeTime}</strong>
                </div>
              </div>
            </div>

            {/* Log Sleep Duration Slider matching Page 8 */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Log Sleep Duration</span>
                <span style={{ 
                  backgroundColor: 'rgba(139, 92, 246, 0.25)', 
                  color: '#8b5cf6', 
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  7h 30m ({duration} hrs)
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="14" 
                step="0.5"
                value={duration}
                onChange={e => setDuration(parseFloat(e.target.value))}
              />
            </div>

            {/* Hours Awake / Wake-Up Baseline Slider matching Page 8 */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Hours Awake / Wake-Up Baseline</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#00bcd4' }}>
                  Continuous Awake Duration {awakeHoursInput.toFixed(1)} hrs
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="36" 
                step="0.5"
                value={awakeHoursInput}
                onChange={e => setAwakeHoursInput(parseFloat(e.target.value))}
                style={{ accentColor: '#00bcd4' }}
              />
            </div>

            {/* Sleep Quality Segmented Buttons matching Page 8 */}
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                Sleep Quality
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                {qualityOptions.map(q => {
                  const isSelected = quality === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid #8b5cf6' : '1px solid var(--border-glass)',
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-card-solid)',
                        color: '#ffffff',
                        fontWeight: isSelected ? '700' : '400',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interruptions counter */}
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                Interruptions (Night Wake-ups)
              </span>
              <input 
                type="number"
                min="0"
                max="10"
                value={interruptions}
                onChange={e => setInterruptions(parseInt(e.target.value, 10) || 0)}
                className="input-field"
                style={{ paddingLeft: '1rem' }}
              />
            </div>

            <button type="submit" className="btn-purple" style={{ padding: '0.9rem', fontSize: '1rem', borderRadius: '0.65rem' }} disabled={loading}>
              {loading ? 'Saving Entry...' : 'Save Sleep Entry'}
            </button>
          </form>

          {/* Side History */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#ffffff' }}>
              Logged Sleep Sessions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
              {logs.sleep && logs.sleep.length > 0 ? (
                logs.sleep.map((log, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block' }}>{log.duration} hrs</strong>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Quality: {log.quality}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#8b5cf6', display: 'block' }}>Recovery 85%</span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(log.endTime || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No sleep logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AIParser 
          type="sleep" 
          placeholder="e.g. Slept 7.5 hours last night with good quality sleep." 
          buttonText="Parse Sleep with AI" 
          accentColor="#8b5cf6" 
        />
      )}
    </div>
  );
}

