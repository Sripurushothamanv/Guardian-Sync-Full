import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { HeartPulse, CheckCircle2, Shield, BatteryCharging } from 'lucide-react';

export default function RecoveryScreen() {
  const { dashboardData } = useContext(AppContext);
  const recoveryScore = dashboardData?.recoveryScore || 82;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <BatteryCharging size={48} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1.5px' }}>READINESS RECOVERY SCORE</span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#10b981', margin: '0.5rem 0' }}>{recoveryScore}%</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Optimal physiological readiness for clinical duty.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Personalized Recovery Routine</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem' }}>Hydrate with 500ml water to clear metabolic caffeine clearance products.</span>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem' }}>Dim room lights 30 minutes prior to scheduled sleep session.</span>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem' }}>Engage in 10 minutes of deep box breathing to lower post-shift cortisol.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
