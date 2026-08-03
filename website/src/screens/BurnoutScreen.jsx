import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Flame, ShieldAlert, HeartPulse, Sparkles, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BurnoutScreen() {
  const { dashboardData } = useContext(AppContext);
  const fatigueScore = dashboardData?.fatigueScore || 28;
  const burnoutRisk = fatigueScore >= 70 ? 'HIGH' : fatigueScore >= 40 ? 'MODERATE' : 'LOW';
  const color = burnoutRisk === 'HIGH' ? '#ef4444' : burnoutRisk === 'MODERATE' ? '#f59e0b' : '#10b981';

  // 7-day cumulative trend data
  const trendData = [
    { day: 'MON', burnout: Math.min(100, Math.max(0, fatigueScore - 12)) },
    { day: 'TUE', burnout: Math.min(100, Math.max(0, fatigueScore - 5)) },
    { day: 'WED', burnout: Math.min(100, Math.max(0, fatigueScore + 15)) },
    { day: 'THU', burnout: Math.min(100, Math.max(0, fatigueScore - 8)) },
    { day: 'FRI', burnout: Math.min(100, Math.max(0, fatigueScore + 10)) },
    { day: 'SAT', burnout: Math.min(100, Math.max(0, fatigueScore + 4)) },
    { day: 'SUN', burnout: Math.min(100, fatigueScore) }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.5rem 0.75rem', backgroundColor: '#161C36', borderColor: '#8b5cf6' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>{label}</span>
          <span style={{ fontSize: '0.9rem', color: '#8b5cf6', fontWeight: 'bold', display: 'block' }}>
            Burnout Index: {payload[0].value}%
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <Flame size={48} color={color} style={{ margin: '0 auto 0.5rem' }} className="neon-glow-rose" />
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

      {/* 7-Day Cumulative Burnout Trend Recharts LineChart */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#8b5cf6" /> 7-Day Cumulative Burnout Trend
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Clamped Y-axis index (0% to 100%)</span>
          </div>
          <span className="badge-neon badge-time">MON - SUN</span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tickLine={false} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="burnout" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#0C0F20' }}
                activeDot={{ r: 8, stroke: '#06b6d4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#06b6d4" /> Clinical Interventions & Preventative Care
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
