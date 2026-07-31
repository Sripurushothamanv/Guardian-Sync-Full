import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import AIVoiceBar from '../components/AIVoiceBar';
import { Clock, CheckCircle } from 'lucide-react';

export default function ShiftScreen() {
  const { addLog, logs, dashboardData } = useContext(AppContext);
  const [shiftType, setShiftType] = useState('Night');
  const [duration, setDuration] = useState('12');
  const [breakDuration, setBreakDuration] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const durHrs = parseFloat(duration);
    const end = new Date();
    const start = new Date(end.getTime() - (durHrs * 3600000));

    await addLog('shift', {
      startTime: start,
      endTime: end,
      duration: durHrs,
      shiftType,
      breakDuration: parseInt(breakDuration, 10)
    });
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Persistent AI Voice & Text Bar */}
      <AIVoiceBar placeholder="Speak or type e.g. 'Working a 12 hour night shift', 'On-call shift for 8 hours'..." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Clock size={28} color="#ec4899" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Log Duty Shift</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Record active hospital shift parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Shift Duty Type</label>
              <select value={shiftType} onChange={e => setShiftType(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                <option value="Night">🦇 Night Shift (+30 Impact)</option>
                <option value="On-Call">🩺 On-Call Shift (+25 Impact)</option>
                <option value="Rotating">🔄 Rotating Shift (+20 Impact)</option>
                <option value="Day">☀️ Day Shift (+10 Impact)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Shift Duration (Hours)</label>
              <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Break Taken (Minutes)</label>
              <input type="number" value={breakDuration} onChange={e => setBreakDuration(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving Shift...' : 'Save Shift Roster'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Current Shift Impact</h2>
          
          {dashboardData?.activeShift ? (
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ec4899', letterSpacing: '1px', display: 'block' }}>ACTIVE DUTY SHIFT</span>
              <h3 style={{ fontSize: '1.25rem', margin: '0.25rem 0' }}>{dashboardData.activeShift.type} Duty</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Duration: {dashboardData.activeShift.duration} hrs ongoing</p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle size={18} color="#10b981" />
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>No active shift right now (Off-Duty Rest)</span>
            </div>
          )}

          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Shift History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
            {logs.shift && logs.shift.length > 0 ? (
              logs.shift.map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{s.shiftType} Shift</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Break: {s.breakDuration} mins</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#ec4899' }}>{s.duration} hrs</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No shift logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
