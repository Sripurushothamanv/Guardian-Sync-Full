import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { BarChart2, Calendar, TrendingDown, Moon, Coffee, Clock, Printer, Download, Sparkles, ShieldCheck } from 'lucide-react';

export default function WeeklyReportScreen() {
  const { dashboardData, user } = useContext(AppContext);

  const days = [
    { day: 'Mon', sleep: 7.5, fatigue: 30, caffeine: 150 },
    { day: 'Tue', sleep: 6.0, fatigue: 48, caffeine: 220 },
    { day: 'Wed', sleep: 5.5, fatigue: 62, caffeine: 310 },
    { day: 'Thu', sleep: 8.0, fatigue: 25, caffeine: 95 },
    { day: 'Fri', sleep: 6.5, fatigue: 42, caffeine: 180 },
    { day: 'Sat', sleep: 7.0, fatigue: 35, caffeine: 120 },
    { day: 'Sun', sleep: 7.2, fatigue: dashboardData?.fatigueScore || 28, caffeine: dashboardData?.activeCaffeine || 45 }
  ];

  const handleExportPDF = () => {
    window.print();
  };

  const sleepEfficiency = 86; // %

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Export PDF Action */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart2 size={32} color="#a855f7" className="neon-glow-purple" />
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>Weekly Shift & Wellness Analytics</h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              Comprehensive performance report for {user?.name || 'Healthcare Worker'} ({user?.department || 'ICU'})
            </p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleExportPDF} 
          className="btn-glow-export"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Printer size={18} /> Export PDF Report
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Sleep Progress */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>AVG SLEEP / NIGHT</span>
            <Moon size={18} color="#6366f1" />
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: '#6366f1' }}>6.8 hrs</span>
          <div className="progress-bar-track" style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar-fill" style={{ width: '85%', backgroundColor: '#6366f1' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem', display: 'block' }}>85% of 8.0h daily target</span>
        </div>

        {/* Fatigue Index Progress */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>AVG FATIGUE INDEX</span>
            <TrendingDown size={18} color="#a855f7" />
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: '#a855f7' }}>39 / 100</span>
          <div className="progress-bar-track" style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar-fill" style={{ width: '39%', backgroundColor: '#a855f7' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem', display: 'block' }}>Low Risk Average</span>
        </div>

        {/* Caffeine Progress */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>WEEKLY CAFFEINE</span>
            <Coffee size={18} color="#f59e0b" />
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: '#f59e0b' }}>1,095 mg</span>
          <div className="progress-bar-track" style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar-fill" style={{ width: '55%', backgroundColor: '#f59e0b' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem', display: 'block' }}>~156 mg / day average</span>
        </div>

        {/* Duty Shift Summary */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>SHIFTS WORKED</span>
            <Clock size={18} color="#ec4899" />
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: '#ec4899' }}>5 Shifts</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', display: 'block' }}>3 Night Shifts • 2 Day Duty</span>
        </div>
      </div>

      {/* Sleep Efficiency Pie Chart & Shift Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        {/* Sleep Efficiency SVG Donut / Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', alignSelf: 'flex-start', marginBottom: '1rem' }}>Sleep Efficiency Index</h3>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="62" stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="transparent" />
              <circle 
                cx="75" 
                cy="75" 
                r="62" 
                stroke="#a855f7" 
                strokeWidth="14" 
                fill="transparent" 
                strokeDasharray={390}
                strokeDashoffset={390 - (390 * (sleepEfficiency / 100))} 
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', display: 'block', lineHeight: '1' }}>{sleepEfficiency}%</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#a855f7' }}>OPTIMAL</span>
            </div>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
            Calculated ratio of total asleep time vs time spent in bed
          </span>
        </div>

        {/* 7-Day Fatigue Breakdown Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>7-Day Fatigue Score Breakdown</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '170px', padding: '0.75rem', background: 'rgba(12, 15, 32, 0.6)', borderRadius: '0.75rem', border: '1px solid var(--border-glass)' }}>
            {days.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>{d.fatigue}</span>
                <div style={{ width: '24px', height: `${d.fatigue * 1.3}px`, background: d.fatigue >= 60 ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '0.35rem 0.35rem 0 0' }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
