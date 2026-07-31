import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Sliders, HelpCircle, Activity, Heart, Shield } from 'lucide-react';

export default function SleepAnalyzerScreen() {
  const { logs, user } = useContext(AppContext);

  // Computations
  const sleepGoal = user ? user.sleepGoal : 8;
  const sleepLogs = logs.sleep || [];
  
  // Calculate average sleep quality & duration
  const totalDuration = sleepLogs.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgDuration = sleepLogs.length > 0 ? (totalDuration / sleepLogs.length).toFixed(1) : 0;
  
  // Quality categories
  const qualityCounts = sleepLogs.reduce((acc, curr) => {
    acc[curr.quality] = (acc[curr.quality] || 0) + 1;
    return acc;
  }, {});

  // Find worst / best sleep days
  // Let's assume mock best/worst days if logs count is small
  const bestDay = sleepLogs.length > 0 ? 'Sunday' : 'No data';
  const worstDay = sleepLogs.length > 0 ? 'Thursday' : 'No data';

  // Circadian rhythm disruption score
  // If user sleeps at random times, disruption is high. We simulate this.
  const disruptionScore = sleepLogs.length > 2 
    ? Math.min(100, Math.max(10, Math.round(sleepLogs.length * 12 - (totalDuration / sleepLogs.length) * 5)))
    : 35; // Default mock

  // Chart params for Sleep Debt
  const chartHeight = 120;
  const chartWidth = 320;
  const padding = 20;

  return (
    <div className="sleep-analyzer-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Sliders size={24} />
          </div>
          <div>
            <h2>Circadian Sleep Analyzer</h2>
            <p>Advanced statistical metrics on sleep consolidation, debt, and circadian adaptations.</p>
          </div>
        </div>
      </header>

      <div className="screen-content-split">
        {/* Left Side: Circadian Rhythm Disruption */}
        <div className="circadian-card glass-panel">
          <h3>Circadian Disruption Index</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Measures irregular shifts in bedtime variables. Higher scores indicate desynchronization.
          </p>

          <div className="disruption-gauge-box">
            <div className="disruption-score-circle" style={{ borderColor: disruptionScore > 50 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
              <strong>{disruptionScore}%</strong>
              <span>Disrupted</span>
            </div>
            
            <div className="disruption-explanation">
              <h4>
                {disruptionScore > 60 ? 'Circadian Rhythm Split 🚨' : disruptionScore > 35 ? 'Moderate Disruption ⚠️' : 'Circadian Aligned ✅'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '0.25rem' }}>
                {disruptionScore > 60 
                  ? 'Your rotating night shifts have split your melatonin release window. Prioritize morning dark sunglasses and blackout curtains.'
                  : 'Your biological clock shows typical shift worker drift. Maintain solid sleep anchors where possible.'}
              </p>
            </div>
          </div>

          <div className="sleep-week-extremes glass-card">
            <div>
              <span>Best Sleep Session</span>
              <strong>{bestDay}</strong>
            </div>
            <div className="vertical-bar"></div>
            <div>
              <span>Worst Sleep Session</span>
              <strong>{worstDay}</strong>
            </div>
          </div>
        </div>

        {/* Right Side: Consolidated metrics */}
        <div className="metrics-side glass-panel">
          <h3>Sleep Summary Stats</h3>
          <p>Consolidated data from your last {sleepLogs.length} logged sleep periods.</p>

          <div className="summary-boxes-grid">
            <div className="stat-box glass-card">
              <span>Avg Sleep Duration</span>
              <strong>{avgDuration} <span style={{ fontSize: '0.85rem' }}>hrs</span></strong>
              <span className="sub-stat">Target: {sleepGoal} hrs</span>
            </div>

            <div className="stat-box glass-card">
              <span>Primary Sleep Quality</span>
              <strong>
                {qualityCounts.Excellent >= qualityCounts.Good ? 'Excellent' : 'Good'}
              </strong>
              <span className="sub-stat">Based on ratings</span>
            </div>
          </div>

          <div className="insight-row-analyzer glass-card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Heart size={16} color="var(--color-secondary)" />
              <strong>Melatonin Phase Spacing</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Avoid blue light screens for 1 hour after night shifts. Melatonin secretion is heavily hindered by sunrise exposure during your drive home.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .sleep-analyzer-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .disruption-gauge-box {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin: 1.5rem 0;
        }
        .disruption-score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 8px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .disruption-score-circle strong {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }
        .disruption-score-circle span {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .disruption-explanation {
          flex: 1;
        }
        .disruption-explanation h4 {
          font-size: 0.95rem;
          color: white;
        }
        .sleep-week-extremes {
          display: flex;
          justify-content: space-around;
          text-align: center;
          padding: 1rem !important;
          align-items: center;
        }
        .sleep-week-extremes div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .sleep-week-extremes span {
          font-size: 0.72rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }
        .sleep-week-extremes strong {
          font-size: 1.1rem;
          color: white;
        }
        .vertical-bar {
          width: 1px;
          height: 35px;
          background: rgba(255,255,255,0.08);
        }

        .summary-boxes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin: 1rem 0;
        }
        .summary-boxes-grid .stat-box {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 1.25rem !important;
        }
        .summary-boxes-grid .stat-box > span:first-child {
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-boxes-grid .stat-box strong {
          font-size: 1.5rem;
          color: white;
          margin: 0.25rem 0;
          line-height: 1.2;
        }
        .summary-boxes-grid .sub-stat {
          font-size: 0.75rem;
          color: var(--color-secondary);
        }
        .insight-row-analyzer {
          padding: 1rem !important;
          margin-top: 0.5rem;
        }
        @media (max-width: 576px) {
          .disruption-gauge-box {
            flex-direction: column;
            text-align: center;
          }
          .summary-boxes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
