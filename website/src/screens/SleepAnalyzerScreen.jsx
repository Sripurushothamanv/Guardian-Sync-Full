import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Moon, Star, TrendingDown, Clock } from 'lucide-react';

export default function SleepAnalyzerScreen() {
  const { dashboardData } = useContext(AppContext);
  const sleepDebt = dashboardData?.sleepDebt || 1.0;
  const avgSleep = 7.5;
  const disruptionPct = 20;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Donut Chart Circadian Disruption Card matching Page 16 */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="52" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="transparent" />
            <circle 
              cx="65" 
              cy="65" 
              r="52" 
              stroke="#8b5cf6" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={326}
              strokeDashoffset={326 - (326 * (disruptionPct / 100))} 
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', display: 'block', lineHeight: '1' }}>{disruptionPct}%</span>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
            Circadian Disruption
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            Circadian aligned. Maintain consistent sleep.
          </p>
        </div>
      </div>

      {/* Sleep Summary Stats 2x2 Grid matching Page 16 */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Sleep Summary Stats
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          
          {/* Avg Sleep Duration */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Avg Sleep Duration</span>
              <Moon size={18} color="#8b5cf6" />
            </div>
            <div>
              <strong style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', display: 'block' }}>{avgSleep} hrs</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', display: 'block' }}>Target: 8 hrs</span>
            </div>
          </div>

          {/* Primary Sleep Quality */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Primary Sleep Quality</span>
              <Star size={18} color="#ff9f43" />
            </div>
            <div>
              <strong style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', display: 'block' }}>Good</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', display: 'block' }}>Based on ratings</span>
            </div>
          </div>

          {/* Cumulative Debt */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Cumulative Debt</span>
              <TrendingDown size={18} color="#00bcd4" />
            </div>
            <div>
              <strong style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', display: 'block' }}>{sleepDebt.toFixed(1)} hrs</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', display: 'block' }}>Target: 0 hrs</span>
            </div>
          </div>

          {/* Disruption Index */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Disruption Index</span>
              <Clock size={18} color="#00bcd4" />
            </div>
            <div>
              <strong style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', display: 'block' }}>{disruptionPct}%</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', display: 'block' }}>Normal range</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

