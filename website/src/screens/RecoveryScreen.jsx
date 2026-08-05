import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

export default function RecoveryScreen() {
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 mins = 900s
  const [isRunning, setIsRunning] = useState(false);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(900);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Guided Sleep Anchor Nap Card matching Page 17 */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.35rem 0' }}>
          Guided Sleep Anchor Nap
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '1.75rem' }}>
          Pink noise generator active in background
        </span>

        {/* 15:00 Countdown Timer Circle matching Page 17 */}
        <div style={{ 
          width: '160px', 
          height: '160px', 
          borderRadius: '50%', 
          border: '4px solid #8b5cf6', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.75rem',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
        }}>
          <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffffff' }}>
            {formatTimer(secondsLeft)}
          </span>
        </div>

        {/* Action Buttons matching Page 17 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleReset} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button 
            onClick={() => setIsRunning(!isRunning)} 
            className="btn-purple" 
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', borderRadius: '999px' }}
          >
            <Play size={16} fill="white" /> {isRunning ? 'Pause Nap' : 'Start Nap'}
          </button>
        </div>
      </div>

      {/* Personalized Recovery Feeds matching Page 17 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Personalized Recovery Feeds
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00bcd4' }} />
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Melatonin Phase Curfew</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5', margin: 0 }}>
              Wear dark sunglasses if driving home after morning night duties to prevent bright solar exposure from blocking melatonin.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Vagal Deep Breathing</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5', margin: 0 }}>
              Perform 4s inhale, 4s hold, 6s exhale breathing cycles to trigger parasympathetic vagus alignment.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

