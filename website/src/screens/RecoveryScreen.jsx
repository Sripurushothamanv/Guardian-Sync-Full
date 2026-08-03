import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { HeartPulse, CheckCircle2, Shield, BatteryCharging, Zap, Clock, Sparkles } from 'lucide-react';

export default function RecoveryScreen() {
  const { dashboardData } = useContext(AppContext);
  const recoveryScore = dashboardData?.recoveryScore || 82;

  const napProtocols = [
    {
      title: '20-Min Power Nap',
      type: 'Stage 2 Light Sleep',
      benefit: 'Immediate alertness boost without sleep inertia',
      bestFor: 'Pre-shift or mid-duty call-room break',
      badgeColor: '#10b981'
    },
    {
      title: '90-Min Full Cycle Nap',
      type: 'Complete REM & Deep Cycle',
      benefit: 'Clears accumulated sleep debt & restores cognitive focus',
      bestFor: 'Post-night shift before driving home',
      badgeColor: '#8b5cf6'
    },
    {
      title: 'Caffeine Nap (Coffee Nap)',
      type: '100mg Caffeine + 15-Min Nap',
      benefit: 'Caffeine kicks in right as you wake up for max alertness',
      bestFor: 'Emergency alertness during long duty hours',
      badgeColor: '#f59e0b'
    }
  ];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Readiness SVG Circular Gauge */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <BatteryCharging size={36} color="#10b981" className="neon-glow-emerald" style={{ marginBottom: '0.5rem' }} />
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1.5px', display: 'block' }}>
            READINESS & RECOVERY SCORE
          </span>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Physiological readiness for clinical duty & emergency procedures
          </p>
        </div>

        {/* Circular SVG Gauge */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="transparent" />
            <circle 
              cx="80" 
              cy="80" 
              r="70" 
              stroke="#10b981" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * (recoveryScore / 100))} 
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', display: 'block', lineHeight: '1' }}>{recoveryScore}%</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981' }}>OPTIMAL</span>
          </div>
        </div>
      </div>

      {/* Power Nap Protocols */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="#8b5cf6" /> Clinical Power Nap Protocols
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {napProtocols.map((nap, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="badge-status" style={{ backgroundColor: `${nap.badgeColor}20`, color: nap.badgeColor, border: `1px solid ${nap.badgeColor}40`, marginBottom: '0.5rem', display: 'inline-block' }}>
                  {nap.type}
                </span>
                <h4 style={{ fontSize: '1.1rem', margin: '0.35rem 0' }}>{nap.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>{nap.benefit}</p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', fontStyle: 'italic' }}>
                Best for: {nap.bestFor}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Recovery Routines */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#10b981" /> Active Recovery & Readiness Routine
        </h3>

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
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem' }}>Avoid screen exposure (blue light) 20 minutes before bedtime.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
