import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Moon, Clock, Star, Calendar, Sun } from 'lucide-react';

export default function SleepScreen() {
  const { addLog, logs, dashboardData, setAwakeHours } = useContext(AppContext);
  
  // Bedtime selectors (12-hour format)
  const [bedHour, setBedHour] = useState('11');
  const [bedMin, setBedMin] = useState('00');
  const [bedAmPm, setBedAmPm] = useState('PM');
  
  // Wake-Up selectors (12-hour format)
  const [wakeHour, setWakeHour] = useState('07');
  const [wakeMin, setWakeMin] = useState('30');
  const [wakeAmPm, setWakeAmPm] = useState('AM');

  const [duration, setDuration] = useState('8.5');
  const [quality, setQuality] = useState('Good');
  const [wakeUps, setWakeUps] = useState('0');
  const [hoursAwakeInput, setHoursAwakeInput] = useState(dashboardData?.awakeHours || 6.2);
  const [loading, setLoading] = useState(false);

  // Helper to convert 12-hour format to Date object for today/yesterday
  const calculateDurationFromTimes = () => {
    let bedH = parseInt(bedHour, 10);
    if (bedAmPm === 'PM' && bedH < 12) bedH += 12;
    if (bedAmPm === 'AM' && bedH === 12) bedH = 0;
    const bedM = parseInt(bedMin, 10);

    let wakeH = parseInt(wakeHour, 10);
    if (wakeAmPm === 'PM' && wakeH < 12) wakeH += 12;
    if (wakeAmPm === 'AM' && wakeH === 12) wakeH = 0;
    const wakeM = parseInt(wakeMin, 10);

    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60; // Crosses midnight
    }

    const diffHrs = (wakeMinutes - bedMinutes) / 60;
    setDuration(diffHrs.toFixed(1));
  };

  useEffect(() => {
    calculateDurationFromTimes();
  }, [bedHour, bedMin, bedAmPm, wakeHour, wakeMin, wakeAmPm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const durHrs = parseFloat(duration);
    
    // Construct Date objects
    const end = new Date();
    const start = new Date(end.getTime() - (durHrs * 3600000));
    
    await addLog('sleep', {
      startTime: start,
      endTime: end,
      duration: durHrs,
      quality,
      wakeUps: parseInt(wakeUps, 10)
    });

    if (hoursAwakeInput) {
      setAwakeHours(parseFloat(hoursAwakeInput));
    }

    setLoading(false);
  };

  const hoursOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesOptions = ['00', '15', '30', '45'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Sleep Logging Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Moon size={28} color="#6366f1" className="neon-glow-purple" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Log Sleep Session</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Record bedtime, wake-up time & awake baseline</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Bedtime Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                🌙 Bedtime (12-Hour Format)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <select value={bedHour} onChange={e => setBedHour(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }}>
                  {hoursOptions.map(h => <option key={h} value={h}>{h} Hour</option>)}
                </select>
                <select value={bedMin} onChange={e => setBedMin(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }}>
                  {minutesOptions.map(m => <option key={m} value={m}>{m} Min</option>)}
                </select>
                <select value={bedAmPm} onChange={e => setBedAmPm(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Wake-Up Time Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                ☀️ Wake-Up Time (12-Hour Format)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <select value={wakeHour} onChange={e => setWakeHour(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }}>
                  {hoursOptions.map(h => <option key={h} value={h}>{h} Hour</option>)}
                </select>
                <select value={wakeMin} onChange={e => setWakeMin(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }}>
                  {minutesOptions.map(m => <option key={m} value={m}>{m} Min</option>)}
                </select>
                <select value={wakeAmPm} onChange={e => setWakeAmPm(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Dynamically Calculated Duration & Hours Awake */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Calculated Duration (hrs)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  className="input-field" 
                  style={{ paddingLeft: '1rem', fontWeight: 'bold', color: '#6366f1' }} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Hours Awake / Baseline Awake</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={hoursAwakeInput} 
                  onChange={e => setHoursAwakeInput(e.target.value)} 
                  className="input-field" 
                  style={{ paddingLeft: '1rem', fontWeight: 'bold', color: '#06b6d4' }} 
                  required 
                />
              </div>
            </div>

            {/* Sleep Quality & Wake-ups */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Sleep Quality</label>
                <select value={quality} onChange={e => setQuality(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(12, 15, 32, 0.9)' }}>
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
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Saving...' : 'Save Sleep Entry'}
            </button>
          </form>
        </div>

        {/* Sleep History & Stats */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Sleep Logs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
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
