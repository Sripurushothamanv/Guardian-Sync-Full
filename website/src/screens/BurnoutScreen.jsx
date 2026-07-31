import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { ShieldAlert, AlertTriangle, Flame, TrendingUp, Heart, CheckSquare } from 'lucide-react';

export default function BurnoutScreen() {
  const { weeklyReport, logs } = useContext(AppContext);

  // Fallback if weekly report is loading
  const fatigueTrend = weeklyReport ? weeklyReport.fatigueTrend : [
    { day: 'Mon', score: 45 }, { day: 'Tue', score: 58 }, { day: 'Wed', score: 72 },
    { day: 'Thu', score: 78 }, { day: 'Fri', score: 68 }, { day: 'Sat', score: 75 },
    { day: 'Sun', score: 82 }
  ];

  const avgFatigue = fatigueTrend.reduce((sum, item) => sum + item.score, 0) / fatigueTrend.length;
  const isBurnoutTriggered = avgFatigue >= 70;

  // Count night shifts
  const recentShifts = logs.shift || [];
  const recentNightShiftsCount = recentShifts.filter(s => {
    const elapsedDays = (new Date() - new Date(s.startTime)) / (1000 * 60 * 60 * 24);
    return elapsedDays <= 7 && s.shiftType === 'Night';
  }).length;

  // Build bar chart coordinates
  const chartHeight = 160;
  const chartWidth = 325;
  const padding = 28;
  const barWidth = 24;
  const gap = (chartWidth - padding * 2) / fatigueTrend.length;

  return (
    <div className="burnout-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2>Burnout Risk & Cumulative Stress</h2>
            <p>Monitor your 7-day cumulative exhaustion indices and triggers.</p>
          </div>
        </div>
      </header>

      {isBurnoutTriggered && (
        <div className="toast-alert danger-glow-pulse glass-panel">
          <AlertTriangle size={18} color="var(--color-danger)" />
          <span>BURNOUT ALARM: Your average fatigue has exceeded 70% over the last consecutive 3+ days. Roster adaptation is highly recommended.</span>
        </div>
      )}

      <div className="screen-content-split">
        {/* Left Side: Cumulative stress chart */}
        <div className="chart-side glass-panel">
          <div className="panel-title-row">
            <TrendingUp size={18} color="var(--color-danger)" />
            <h3>7-Day Cumulative Burnout Trend</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Exhaustion scores tracked daily. Horizontal red line indicates high-burnout threshold (70%).
          </p>

          <div className="burnout-chart-box" style={{ marginBottom: '1.25rem' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
              {/* Threshold line */}
              <line 
                x1={padding} y1={chartHeight - padding - (70/100)*(chartHeight-padding*2)} 
                x2={chartWidth - padding} y2={chartHeight - padding - (70/100)*(chartHeight-padding*2)} 
                stroke="var(--color-danger)" strokeWidth="1.5" strokeDasharray="4 4"
              />

              {/* Draw bars */}
              {fatigueTrend.map((item, idx) => {
                const clampedScore = Math.min(100, Math.max(0, item.score));
                const x = padding + idx * gap + (gap - barWidth) / 2;
                const h = (clampedScore / 100) * (chartHeight - padding * 2);
                const y = chartHeight - padding - h;
                const isOverThreshold = clampedScore >= 70;
                const color = isOverThreshold ? 'var(--color-danger)' : 'var(--color-primary)';
                
                return (
                  <g key={idx}>
                    <rect 
                      x={x} y={y} width={barWidth} height={h} 
                      rx="4" fill={color} opacity="0.8"
                    />
                    <text x={x + barWidth/2} y={chartHeight - 6} fontSize="8" fill="var(--text-secondary)" textAnchor="middle">
                      {item.day}
                    </text>
                    <text x={x + barWidth/2} y={y - 5} fontSize="9" fontWeight="700" fill="white" textAnchor="middle">
                      {clampedScore}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="burnout-stat-capsule glass-card">
            <div>
              <span>Weekly Fatigue Average</span>
              <strong style={{ color: isBurnoutTriggered ? 'var(--color-danger)' : 'white' }}>
                {Math.round(avgFatigue)}%
              </strong>
            </div>
            <div>
              <span>Night Shifts (7 Days)</span>
              <strong>{recentNightShiftsCount} / 3 max</strong>
            </div>
          </div>
        </div>

        {/* Right Side: Preventative actions checklist */}
        <div className="checklist-side glass-panel">
          <div className="panel-title-row">
            <Heart size={18} color="var(--color-safe)" />
            <h3>Burnout Preventative Protocols</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Recommended lifestyle behaviors to prevent chronic fatigue:
          </p>

          <div className="prevention-checklist">
            <div className="check-item glass-card">
              <CheckSquare size={18} color="var(--color-safe)" />
              <div>
                <strong>Circadian Adaptation Gap</strong>
                <p>Observe at least 11 hours of resting separation between rotating shift rosters.</p>
              </div>
            </div>

            <div className="check-item glass-card">
              <CheckSquare size={18} color="var(--color-safe)" />
              <div>
                <strong>Strategic Power Naps</strong>
                <p>Implement a 15–20 minute power nap before driving home to reset motor latencies.</p>
              </div>
            </div>

            <div className="check-item glass-card">
              <CheckSquare size={18} color="var(--color-safe)" />
              <div>
                <strong>Hydration Saturation</strong>
                <p>Drink 500ml water for every cup of coffee logged to avoid cellular dehydration.</p>
              </div>
            </div>

            <div className="check-item glass-card">
              <CheckSquare size={18} color="var(--color-safe)" />
              <div>
                <strong>Roster Caps</strong>
                <p>Limit rosters to a maximum of 3 consecutive night-shift duties.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .burnout-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
        }
        .panel-title-row h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }
        .burnout-chart-box {
          height: 170px;
          background: rgba(10, 14, 30, 0.3);
          border-radius: var(--border-radius-md);
          border: 1px solid rgba(255,255,255,0.03);
          padding: 0.5rem;
          margin: 1rem 0;
        }
        .burnout-stat-capsule {
          display: flex;
          justify-content: space-around;
          text-align: center;
          padding: 1rem !important;
        }
        .burnout-stat-capsule div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .burnout-stat-capsule span {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }
        .burnout-stat-capsule strong {
          font-size: 1.5rem;
          font-weight: 800;
        }
        
        .prevention-checklist {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem !important;
        }
        .check-item div strong {
          font-size: 0.85rem;
          color: white;
        }
        .check-item div p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.35;
          margin-top: 0.1rem;
        }
      `}</style>
    </div>
  );
}
