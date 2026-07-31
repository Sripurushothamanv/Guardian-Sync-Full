import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import AIVoiceBar from '../components/AIVoiceBar';
import { Moon, Clock, Star, Calendar } from 'lucide-react';

export default function SleepScreen() {
  const { addLog, logs } = useContext(AppContext);
  const [duration, setDuration] = useState('7.5');
  const [quality, setQuality] = useState('Good');
  const [wakeUps, setWakeUps] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const durHrs = parseFloat(duration);
    const end = new Date();
    const start = new Date(end.getTime() - (durHrs * 3600000));
    
    await addLog('sleep', {
      startTime: start,
      endTime: end,
      duration: durHrs,
      quality,
      wakeUps: parseInt(wakeUps, 10)
    });
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Persistent AI Voice & Text Bar */}
      <AIVoiceBar placeholder="Speak or type e.g. 'Slept 7.5 hours last night', 'Restless sleep for 5 hours'..." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Moon size={28} color="#6366f1" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Log Sleep Session</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Record sleep duration & recovery quality</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Sleep Duration (Hours)</label>
              <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Sleep Quality</label>
              <select value={quality} onChange={e => setQuality(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                <option value="Excellent">⭐ Excellent</option>
                <option value="Good">👍 Good</option>
                <option value="Fair">😐 Fair</option>
                <option value="Poor">🥱 Poor</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Night Wake-ups</label>
              <input type="number" value={wakeUps} onChange={e => setWakeUps(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} min="0" max="10" />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Saving...' : 'Save Sleep Entry'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Sleep Logs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto' }}>
            {logs.sleep && logs.sleep.length > 0 ? (
              logs.sleep.map((log, i) => (
                <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', display: 'block' }}>{log.duration} hrs</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Quality: {log.quality} • Wakeups: {log.wakeUps || 0}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981', display: 'block' }}>+{log.recoveryScore || 80} Recovery</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(log.endTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>No sleep logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
