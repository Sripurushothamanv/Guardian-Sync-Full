import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Flame, ShieldAlert, HeartPulse, Sparkles } from 'lucide-react';

export default function BurnoutScreen() {
  const { dashboardData } = useContext(AppContext);
  const fatigueScore = dashboardData?.fatigueScore || 28;
  const burnoutRisk = fatigueScore >= 70 ? 'HIGH' : fatigueScore >= 40 ? 'MODERATE' : 'LOW';
  const color = burnoutRisk === 'HIGH' ? '#ef4444' : burnoutRisk === 'MODERATE' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <Flame size={48} color={color} style={{ margin: '0 auto 0.5rem' }} />
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1.5px' }}>CLINICAL BURNOUT RISK INDEX</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color, margin: '0.5rem 0' }}>{burnoutRisk} RISK LEVEL</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Calculated from consecutive night shifts, 7-day sleep debt, and active caffeine accumulation.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>EXHAUSTION SCORE</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color }}>{fatigueScore}%</span>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>RECOVERY BUFFER</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>{dashboardData?.recoveryScore || 80}%</span>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>SLEEP DEBT</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#6366f1' }}>{dashboardData?.sleepDebt || 1.5}h</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#06b6d4" /> Preventive Interventions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <strong style={{ color: '#06b6d4', display: 'block', marginBottom: '0.25rem' }}>1. Strategic Micro-Naps</strong>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>A 20-minute power nap in call-rooms reduces alertness fatigue by 35% without sleep inertia.</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <strong style={{ color: '#06b6d4', display: 'block', marginBottom: '0.25rem' }}>2. Post-Shift Hydration Protocol</strong>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Drink 500ml of water at shift end to counter active caffeine vasoconstriction.</p>
          </div>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <strong style={{ color: '#06b6d4', display: 'block', marginBottom: '0.25rem' }}>3. Dark & Quiet Recovery Environment</strong>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Use blackout curtains and earplugs to achieve deep REM cycles after night shifts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
