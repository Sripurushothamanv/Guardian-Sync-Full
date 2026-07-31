import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Moon, TrendingUp, Zap, Clock } from 'lucide-react';

export default function SleepAnalyzerScreen() {
  const { dashboardData, logs } = useContext(AppContext);
  const sleepDebt = dashboardData?.sleepDebt || 1.5;
  const lastNightSleep = dashboardData?.lastNightSleep || 7.2;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Moon size={28} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Sleep Debt & Recovery Analyzer</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>7-Day Cumulative Sleep Architecture Analysis</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>7-DAY SLEEP DEBT</span>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: sleepDebt > 4 ? '#ef4444' : '#10b981' }}>{sleepDebt} hrs</span>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>LAST NIGHT SLEEP</span>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#6366f1' }}>{lastNightSleep} hrs</span>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>QUALITY SCORE</span>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#06b6d4' }}>{dashboardData?.recoveryScore || 82}%</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#818cf8' }}>Clinical Recommendation</h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
            {sleepDebt > 3 ? `You have an accumulated sleep debt of ${sleepDebt} hours. Aim for 8.5 hours of continuous recovery sleep tonight to prevent severe cognitive slowdown.` : `Your sleep architecture is well maintained. Continue targeting 7.5 - 8 hours per night.`}
          </p>
        </div>
      </div>
    </div>
  );
}
