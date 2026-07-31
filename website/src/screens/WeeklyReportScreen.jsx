import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { BarChart2, Calendar, TrendingDown, Moon, Coffee, Clock } from 'lucide-react';

export default function WeeklyReportScreen() {
  const { dashboardData } = useContext(AppContext);

  const days = [
    { day: 'Mon', sleep: 7.5, fatigue: 30, caffeine: 150 },
    { day: 'Tue', sleep: 6.0, fatigue: 48, caffeine: 220 },
    { day: 'Wed', sleep: 5.5, fatigue: 62, caffeine: 310 },
    { day: 'Thu', sleep: 8.0, fatigue: 25, caffeine: 95 },
    { day: 'Fri', sleep: 6.5, fatigue: 42, caffeine: 180 },
    { day: 'Sat', sleep: 7.0, fatigue: 35, caffeine: 120 },
    { day: 'Sun', sleep: 7.2, fatigue: dashboardData?.fatigueScore || 28, caffeine: dashboardData?.activeCaffeine || 45 }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <BarChart2 size={28} color="#a855f7" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Weekly Shift Analytics & Performance</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>7-day fatigue trends & sleep recovery metrics</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>AVG SLEEP / NIGHT</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#6366f1' }}>6.8 hrs</span>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>AVG FATIGUE INDEX</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#a855f7' }}>39 / 100</span>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>WEEKLY CAFFEINE</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b' }}>1,095 mg</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>7-Day Fatigue Trend Breakdown</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0.75rem', border: '1px solid var(--border-glass)' }}>
          {days.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>{d.fatigue}</span>
              <div style={{ width: '28px', height: `${d.fatigue * 1.5}px`, background: d.fatigue >= 60 ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '0.35rem 0.35rem 0 0', transition: 'height 0.3s' }} />
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
