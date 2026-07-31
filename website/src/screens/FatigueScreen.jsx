import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Activity, Sliders, RefreshCw, Zap } from 'lucide-react';

export default function FatigueScreen() {
  const { dashboardData, applyFatigueSimulation } = useContext(AppContext);
  const [simSleepDebt, setSimSleepDebt] = useState(dashboardData?.sleepDebt || 2.0);
  const [simAwakeHours, setSimAwakeHours] = useState(dashboardData?.awakeHours || 14.0);
  const [simCaffeine, setSimCaffeine] = useState(dashboardData?.activeCaffeine || 150);
  const [simShiftType, setSimShiftType] = useState('Night');

  const handleSimulate = () => {
    applyFatigueSimulation({
      simSleepDebt: Number(simSleepDebt),
      simAwakeHours: Number(simAwakeHours),
      simCaffeine: Number(simCaffeine),
      simShiftType
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Sliders size={28} color="#ef4444" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Fatigue Simulator</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Adjust load factors to simulate readiness</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span>Sleep Debt: <strong>{simSleepDebt} hrs</strong></span>
            </div>
            <input type="range" min="0" max="10" step="0.5" value={simSleepDebt} onChange={e => setSimSleepDebt(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span>Hours Awake: <strong>{simAwakeHours} hrs</strong></span>
            </div>
            <input type="range" min="0" max="30" step="1" value={simAwakeHours} onChange={e => setSimAwakeHours(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span>Active Caffeine: <strong>{simCaffeine} mg</strong></span>
            </div>
            <input type="range" min="0" max="500" step="25" value={simCaffeine} onChange={e => setSimCaffeine(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Shift Duty Impact</label>
            <select value={simShiftType} onChange={e => setSimShiftType(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
              <option value="Night">🦇 Night Shift (+30)</option>
              <option value="On-Call">🩺 On-Call Shift (+25)</option>
              <option value="Rotating">🔄 Rotating Shift (+20)</option>
              <option value="Day">☀️ Day Shift (+10)</option>
            </select>
          </div>

          <button onClick={handleSimulate} className="btn-primary" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Zap size={18} /> Apply Simulation Load
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Activity size={48} color={dashboardData?.fatigueScore >= 70 ? '#ef4444' : '#10b981'} style={{ marginBottom: '1rem' }} />
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1px' }}>SIMULATED FATIGUE INDEX</span>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', margin: '0.5rem 0' }}>{dashboardData?.fatigueScore || 28}</h1>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: dashboardData?.fatigueScore >= 70 ? '#ef4444' : '#10b981' }}>
          {dashboardData?.fatigueLevel || 'Low'} Risk Level
        </span>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '1rem', maxWidth: '300px' }}>
          {dashboardData?.driveSafety?.advice}
        </p>
      </div>
    </div>
  );
}
