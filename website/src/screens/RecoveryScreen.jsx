import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Flame, Play, Pause, RotateCcw, AlertCircle, Heart, Shield } from 'lucide-react';

export default function RecoveryScreen() {
  const { dashboardData } = useContext(AppContext);
  const { fatigueScore, driveSafety, activeCaffeine } = dashboardData;

  // Power Nap Timer States
  const [secondsLeft, setSecondsLeft] = useState(15 * 60); // 15 mins
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerActive(false);
      alert('Your 15-minute power nap is complete! Stretch and verify your alertness with our Reaction Test.');
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setSecondsLeft(15 * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Determine suggestions based on status
  const getSuggestions = () => {
    const suggestions = [];

    if (fatigueScore >= 60) {
      suggestions.push({
        title: 'Guided 15-Min Power Nap',
        desc: 'Before driving, set our timer below. Napping for 15-20 minutes clears sleep-inducing adenosine receptors without causing sleep inertia.',
        priority: 'critical'
      });
    }

    if (activeCaffeine > 150) {
      suggestions.push({
        title: 'Flush Caffeine Saturation',
        desc: 'Drink at least 500ml of mineralized water. Caffeine acts as a strong renal diuretic, and hydration aids in clearing metabolic wastes.',
        priority: 'moderate'
      });
    }

    suggestions.push({
      title: 'Sunrise Melatonin Shielding',
      desc: 'If driving home after an overnight shift, wear dark polarized sunglasses. Exposure to bright early morning sunlight blocks melatonin synthesis, hindering subsequent daytime sleep.',
      priority: 'recommended'
    });

    suggestions.push({
      title: 'Deep Vagal Breathing Exercise',
      desc: 'Inhale for 4 seconds, hold for 4, exhale for 6. Repeating this for 5 minutes activates the parasympathetic vagal response, reducing heart rate variability stress.',
      priority: 'recommended'
    });

    return suggestions;
  };

  const suggestions = getSuggestions();

  return (
    <div className="recovery-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Flame size={24} />
          </div>
          <div>
            <h2>Post-Shift Recovery Center</h2>
            <p>Personalized bio-hacks and recovery protocols based on your roster exhaustion score.</p>
          </div>
        </div>
      </header>

      <div className="screen-content-split">
        {/* Left Side: Personalized suggestions */}
        <div className="suggestions-side">
          <h3>Your Recovery Recommendations</h3>
          <div className="suggestions-list">
            {suggestions.map((sug, idx) => (
              <div 
                key={idx} 
                className={`sug-card glass-panel ${sug.priority === 'critical' ? 'critical-border' : ''}`}
              >
                <div className="sug-header">
                  <div className="sug-indicator-row">
                    <span className={`sug-dot ${sug.priority}`}></span>
                    <strong>{sug.title}</strong>
                  </div>
                  <span className={`sug-badge ${sug.priority}`}>{sug.priority}</span>
                </div>
                <p>{sug.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Nap timer audio guide visualizer */}
        <div className="timer-side glass-panel">
          <div className="timer-header">
            <h3>Guided Sleep Anchor Nap</h3>
            <p>Guided relaxation timer with pink noise frequency simulation.</p>
          </div>

          <div className="nap-timer-display">
            <div className={`timer-ring ${timerActive ? 'pulsing' : ''}`}>
              <span className="timer-countdown">{formatTime(secondsLeft)}</span>
              <span className="timer-sub">Pink Noise Active</span>
            </div>

            <div className="timer-controls">
              <button className="btn-secondary" onClick={resetTimer}>
                <RotateCcw size={16} /> Reset
              </button>
              <button 
                className="btn-primary" 
                onClick={toggleTimer}
                style={{ background: timerActive ? 'var(--color-danger)' : 'var(--color-primary)' }}
              >
                {timerActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start Nap</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .recovery-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .suggestions-side {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .suggestions-side h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sug-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-radius: var(--border-radius-md);
        }
        .sug-card.critical-border {
          border-left: 5px solid var(--color-danger);
          background: rgba(239, 68, 68, 0.03);
        }
        .sug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sug-indicator-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sug-indicator-row strong {
          font-size: 0.88rem;
          color: white;
        }
        .sug-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .sug-dot.critical { background: var(--color-danger); }
        .sug-dot.moderate { background: var(--color-caution); }
        .sug-dot.recommended { background: var(--color-secondary); }

        .sug-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }
        .sug-badge.critical { background: var(--color-danger-bg); color: #f87171; }
        .sug-badge.moderate { background: var(--color-caution-bg); color: #fbbf24; }
        .sug-badge.recommended { background: rgba(6, 182, 212, 0.1); color: #22d3ee; }

        .sug-card p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .timer-side {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
        }
        .timer-header {
          margin-bottom: 1.5rem;
        }
        .timer-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .timer-header p {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }
        .nap-timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
        }
        .timer-ring {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 6px solid var(--color-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.02);
          transition: var(--transition-smooth);
        }
        .timer-ring.pulsing {
          animation: pulseRing 2s infinite ease-in-out;
          border-color: var(--color-secondary);
        }
        .timer-countdown {
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }
        .timer-sub {
          font-size: 0.68rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .timer-controls {
          display: flex;
          gap: 1rem;
          width: 100%;
          justify-content: center;
        }
        .timer-controls button {
          font-size: 0.85rem;
          padding: 0.6rem 1.25rem !important;
        }

        @keyframes pulseRing {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
