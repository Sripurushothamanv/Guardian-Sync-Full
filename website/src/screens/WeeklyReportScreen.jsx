import React, { useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { FileText, TrendingUp, Moon, Coffee, Clock, ShieldAlert } from 'lucide-react';

export default function WeeklyReportScreen() {
  const { weeklyReport, fetchWeekly } = useContext(AppContext);

  useEffect(() => {
    fetchWeekly();
  }, []);

  const report = weeklyReport || {
    summary: {
      sleep: { avgThisWeek: 7.0, avgLastWeek: 6.5, totalThisWeek: 49.0, totalLastWeek: 45.5 },
      caffeine: { totalThisWeek: 380, totalLastWeek: 450 },
      shifts: { totalThisWeek: 5, totalLastWeek: 6, nightShiftsThis: 2, nightShiftsLast: 3 },
      macros: { calories: 2200, protein: 80, carbs: 250, fats: 70 }
    },
    fatigueTrend: [
      { day: 'Mon', score: 45 }, { day: 'Tue', score: 50 }, { day: 'Wed', score: 65 },
      { day: 'Thu', score: 70 }, { day: 'Fri', score: 55 }, { day: 'Sat', score: 60 },
      { day: 'Sun', score: 50 }
    ]
  };

  const { sleep, caffeine, shifts, macros } = report.summary;

  const CompareMetric = ({ title, valueThis, valueLast, unit = '', color = 'white' }) => {
    const diff = valueThis - valueLast;
    const isBetter = title.includes('Sleep') ? diff > 0 : (title.includes('Caffeine') || title.includes('Fatigue') ? diff < 0 : diff === 0);
    const displayDiff = Math.abs(diff).toFixed(1);

    return (
      <div className="compare-card glass-card">
        <div className="compare-card-title">
          <span>{title}</span>
          <strong style={{ color }}>{valueThis}{unit}</strong>
        </div>
        <div className="compare-card-row">
          <span>Last week: {valueLast}{unit}</span>
          {diff !== 0 ? (
            <span className={`diff-badge ${isBetter ? 'positive' : 'negative'}`}>
              {diff > 0 ? '+' : '-'}{displayDiff}{unit}
            </span>
          ) : (
            <span className="diff-badge neutral">Unchanged</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="weekly-report-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <FileText size={24} />
          </div>
          <div>
            <h2>Weekly Roster & Health Report</h2>
            <p>Every Sunday at 8 PM. Compare sleep debt, shifts, and fatigue loads with the prior week.</p>
          </div>
        </div>
      </header>

      {/* Comparisons grid */}
      <section className="compare-grid">
        <CompareMetric 
          title="Average Sleep Session" 
          valueThis={sleep.avgThisWeek} 
          valueLast={sleep.avgLastWeek} 
          unit="h" 
          color="#8b5cf6" 
        />
        
        <CompareMetric 
          title="Total Work Shifts" 
          valueThis={shifts.totalThisWeek} 
          valueLast={shifts.totalLastWeek} 
          color="#f59e0b" 
        />

        <CompareMetric 
          title="Night Shifts Logged" 
          valueThis={shifts.nightShiftsThis} 
          valueLast={shifts.nightShiftsLast} 
          color="#ef4444" 
        />

        <CompareMetric 
          title="Caffeine Exposure" 
          valueThis={caffeine.totalThisWeek} 
          valueLast={caffeine.totalLastWeek} 
          unit="mg" 
          color="#06b6d4" 
        />
      </section>

      {/* Insights split */}
      <div className="screen-content-split" style={{ marginTop: '1rem' }}>
        {/* Fatigue History Graph */}
        <div className="chart-side glass-panel">
          <div className="panel-title-row">
            <TrendingUp size={18} color="var(--color-primary)" />
            <h3>Fatigue Trends vs Prior Week</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Daily exhaustion indices compared across the week.
          </p>

          <div className="weekly-report-chart-box" style={{ marginBottom: '1.25rem' }}>
            {/* Draw SVG representing fatigue values */}
            <svg viewBox="0 0 320 135" className="svg-chart">
              {report.fatigueTrend.map((t, idx) => {
                const clampedScore = Math.min(100, Math.max(0, t.score));
                const x = 25 + idx * 40;
                const h = (clampedScore / 100) * 80;
                const y = 95 - h;
                return (
                  <g key={idx}>
                    <rect x={x} y={y} width="18" height={h} rx="3" fill="var(--color-primary)" opacity="0.85" />
                    <text x={x + 9} y="118" fontSize="9" fill="var(--text-secondary)" textAnchor="middle">{t.day}</text>
                    <text x={x + 9} y={y - 4} fontSize="8" fontWeight="700" fill="white" textAnchor="middle">{clampedScore}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Nutrition macros weekly average */}
        <div className="checklist-side glass-panel">
          <div className="panel-title-row">
            <FileText size={18} color="var(--color-safe)" />
            <h3>Weekly Nutrition Averages</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Daily nutrition consumption averages for the active week.
          </p>

          <div className="weekly-macros-grid">
            <div className="macro-progress-card glass-card">
              <span>Calories</span>
              <strong>{macros.calories} kcal</strong>
            </div>

            <div className="macro-progress-card glass-card">
              <span>Protein</span>
              <strong>{macros.protein} g</strong>
            </div>

            <div className="macro-progress-card glass-card">
              <span>Carbohydrates</span>
              <strong>{macros.carbs} g</strong>
            </div>

            <div className="macro-progress-card glass-card">
              <span>Fats</span>
              <strong>{macros.fats} g</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .weekly-report-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .compare-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .compare-card {
          padding: 1.25rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .compare-card-title {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .compare-card-title strong {
          font-size: 1.4rem;
          font-weight: 800;
        }
        .compare-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .diff-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }
        .diff-badge.positive { background: var(--color-safe-bg); color: var(--color-safe); }
        .diff-badge.negative { background: var(--color-danger-bg); color: #f87171; }
        .diff-badge.neutral { background: rgba(255,255,255,0.05); color: var(--text-muted); }

        .weekly-report-chart-box {
          height: 140px;
          background: rgba(10, 14, 30, 0.3);
          border-radius: var(--border-radius-md);
          border: 1px solid rgba(255,255,255,0.03);
          padding: 0.5rem;
          margin-top: 1rem;
        }
        .weekly-macros-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .macro-progress-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem !important;
        }
        .macro-progress-card span {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }
        .macro-progress-card strong {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          margin-top: 0.25rem;
        }
        @media (max-width: 992px) {
          .compare-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 576px) {
          .compare-grid {
            grid-template-columns: 1fr;
          }
          .weekly-macros-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
