import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Sliders, Moon, Sun, Coffee } from 'lucide-react';

export default function FatigueScreen() {
  const { dashboardData, applyFatigueSimulation } = useContext(AppContext);
  const [simSleepDebt, setSimSleepDebt] = useState(2.0);
  const [simAwakeHours, setSimAwakeHours] = useState(8.0);
  const [simCaffeine, setSimCaffeine] = useState(150);

  const handleSimulate = () => {
    applyFatigueSimulation({
      simSleepDebt: Number(simSleepDebt),
      simAwakeHours: Number(simAwakeHours),
      simCaffeine: Number(simCaffeine)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Fatigue Analytics Breakdown matching Page 13 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Fatigue Analytics
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Sleep Debt (x3)</span>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>+3.0 pts</strong>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: '30%', backgroundColor: '#8b5cf6' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Hours Awake (x1.5)</span>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>+2.1 pts</strong>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: '21%', backgroundColor: '#ff9f43' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Active Shift Load</span>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>+0 pts</strong>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: '0%', backgroundColor: '#ef4444' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Caffeine Alertness (x0.15)</span>
            <strong style={{ fontSize: '1rem', color: '#ffffff' }}>-0.0 pts</strong>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: '0%', backgroundColor: '#00bcd4' }} />
          </div>
        </div>
      </div>

      {/* Fatigue Planning Simulator matching Page 13 */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sliders size={20} color="#00bcd4" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
            Fatigue Planning Simulator
          </h2>
        </div>

        {/* Big Simulated Risk Score Display matching Page 13 */}
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: '#00b894', margin: 0, lineHeight: 1 }}>
            26
          </h1>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#00b894', letterSpacing: '0.5px' }}>
            Simulated Risk
          </span>
        </div>

        {/* Simulated Sleep Debt Slider Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>
              <Moon size={16} color="#8b5cf6" /> Simulated Sleep Debt
            </div>
            <span style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.25)', 
              color: '#8b5cf6', 
              padding: '0.3rem 0.75rem', 
              borderRadius: '0.4rem',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              {simSleepDebt} hrs
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="0.5" 
            value={simSleepDebt} 
            onChange={e => setSimSleepDebt(parseFloat(e.target.value))} 
          />
        </div>

        {/* Simulated Hours Awake Slider Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>
              <Sun size={16} color="#ff9f43" /> Simulated Hours Awake
            </div>
            <span style={{ 
              backgroundColor: 'rgba(255, 159, 67, 0.25)', 
              color: '#ff9f43', 
              padding: '0.3rem 0.75rem', 
              borderRadius: '0.4rem',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              {simAwakeHours} hrs
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30" 
            step="0.5" 
            value={simAwakeHours} 
            onChange={e => setSimAwakeHours(parseFloat(e.target.value))} 
            style={{ accentColor: '#ff9f43' }}
          />
        </div>

        {/* Simulated Active Caffeine Slider Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>
              <Coffee size={16} color="#00bcd4" /> Simulated Active Caffeine
            </div>
            <span style={{ 
              backgroundColor: 'rgba(0, 188, 212, 0.25)', 
              color: '#00bcd4', 
              padding: '0.3rem 0.75rem', 
              borderRadius: '0.4rem',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              {simCaffeine} mg
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="500" 
            step="10" 
            value={simCaffeine} 
            onChange={e => setSimCaffeine(parseInt(e.target.value, 10))} 
            style={{ accentColor: '#00bcd4' }}
          />
        </div>

        {/* Primary Cyan Button matching Page 13 */}
        <button 
          onClick={handleSimulate} 
          className="btn-cyan" 
          style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', borderRadius: '0.65rem' }}
        >
          SAVE & APPLY TO DASHBOARD
        </button>
      </div>

    </div>
  );
}

