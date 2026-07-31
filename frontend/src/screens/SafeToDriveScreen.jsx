import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Car, AlertTriangle, CheckCircle2, Play, Zap, RefreshCw } from 'lucide-react';

export default function SafeToDriveScreen() {
  const { dashboardData } = useContext(AppContext);
  const { driveSafety, fatigueScore, lastNightSleep, awakeHours } = dashboardData;

  // Reaction Game States
  const [gameState, setGameState] = useState('idle'); // idle, waiting, active, result
  const [reactionTime, setReactionTime] = useState(null);
  const [trialTimes, setTrialTimes] = useState([]);
  const [trialCount, setTrialCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timerId, setTimerId] = useState(null);

  const startTest = () => {
    setTrialTimes([]);
    setTrialCount(0);
    nextTrial();
  };

  const nextTrial = () => {
    setGameState('waiting');
    // Random delay between 1.5s and 4s
    const delay = 1500 + Math.random() * 2500;
    const id = setTimeout(() => {
      setGameState('active');
      setStartTime(performance.now());
    }, delay);
    setTimerId(id);
  };

  const handleTargetClick = () => {
    if (gameState !== 'active') return;
    const clickTime = performance.now();
    const elapsed = Math.round(clickTime - startTime);
    
    const newTrials = [...trialTimes, elapsed];
    setTrialTimes(newTrials);
    setTrialCount(trialCount + 1);

    if (trialCount + 1 < 3) {
      nextTrial();
    } else {
      const avg = Math.round(newTrials.reduce((a, b) => a + b, 0) / 3);
      setReactionTime(avg);
      setGameState('result');
    }
  };

  const handlePrematureClick = () => {
    if (gameState === 'waiting') {
      clearTimeout(timerId);
      alert('Too early! Wait for the screen to turn GREEN.');
      setGameState('idle');
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [timerId]);

  // Evaluate reaction speed
  const getReactionEvaluation = (time) => {
    if (time < 260) return { label: 'Excellent alertness ⚡', color: '#10b981', advice: 'Your motor reactions are sharp. Combine this with the predicted fatigue index to decide.' };
    if (time < 380) return { label: 'Average alertness 👍', color: '#f59e0b', advice: 'Typical reaction time. You are likely functional but may feel slightly fatigued.' };
    return { label: 'Sluggish alertness ⚠️', color: '#ef4444', advice: 'WARNING: Slow reactions detected. We advise against driving. Rest immediately.' };
  };

  const reactionEval = reactionTime ? getReactionEvaluation(reactionTime) : null;

  return (
    <div className="drive-safety-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: `${driveSafety.color}15`, color: driveSafety.color }}>
            <Car size={24} />
          </div>
          <div>
            <h2>Safe-To-Drive Decision Engine</h2>
            <p>Determine cognitive readiness to commute home after exhaustive night shifts.</p>
          </div>
        </div>
      </header>

      <div className="screen-content-split">
        {/* Left Side: Decision checklists */}
        <div className="checklist-card glass-panel">
          <div className="drive-assessment-header" style={{ borderColor: driveSafety.color }}>
            <div className="drive-assess-title">
              <h3>SYSTEM RATING:</h3>
              <span className="drive-assess-status" style={{ color: driveSafety.color }}>{driveSafety.status} TO DRIVE</span>
            </div>
            <p>{driveSafety.advice}</p>
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>Readiness Parameters Check</h3>
          <div className="parameters-list">
            <div className="param-item glass-card">
              <div className="param-title">
                <span>Predicted Fatigue Index</span>
                <strong>{fatigueScore} / 100</strong>
              </div>
              <span className={`status-pill ${fatigueScore < 55 ? 'safe' : fatigueScore < 70 ? 'caution' : 'danger'}`}>
                {fatigueScore < 55 ? 'Pass' : fatigueScore < 70 ? 'Caution' : 'Fail'}
              </span>
            </div>

            <div className="param-item glass-card">
              <div className="param-title">
                <span>Sleep Last Session</span>
                <strong>{lastNightSleep} hours</strong>
              </div>
              <span className={`status-pill ${lastNightSleep >= 6.5 ? 'safe' : lastNightSleep >= 5 ? 'caution' : 'danger'}`}>
                {lastNightSleep >= 6.5 ? 'Pass' : lastNightSleep >= 5 ? 'Caution' : 'Fail'}
              </span>
            </div>

            <div className="param-item glass-card">
              <div className="param-title">
                <span>Duration Awake</span>
                <strong>{awakeHours} hours awake</strong>
              </div>
              <span className={`status-pill ${awakeHours < 15 ? 'safe' : awakeHours < 18 ? 'caution' : 'danger'}`}>
                {awakeHours < 15 ? 'Pass' : awakeHours < 18 ? 'Caution' : 'Fail'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Reaction Test Game */}
        <div className="game-card glass-panel">
          <h3>Quick Alertness Reaction Test</h3>
          <p>Measure motor response speeds to verify real cognitive vigilance.</p>

          <div 
            className={`reaction-canvas glass-card ${gameState}`}
            onClick={gameState === 'waiting' ? handlePrematureClick : (gameState === 'active' ? handleTargetClick : null)}
          >
            {gameState === 'idle' && (
              <div className="canvas-content">
                <Zap size={48} color="var(--color-primary)" className="zap-glow" />
                <h4>Test Your Alertness</h4>
                <p>Click "Start" then tap the target as soon as the screen flashes green.</p>
                <button className="btn-primary" onClick={startTest}>
                  <Play size={14} /> Start Trial Run
                </button>
              </div>
            )}

            {gameState === 'waiting' && (
              <div className="canvas-content waiting">
                <span className="pulse-dots">...</span>
                <h4>Wait for GREEN...</h4>
                <p>Don't click early!</p>
              </div>
            )}

            {gameState === 'active' && (
              <div className="canvas-content target-active">
                <div className="target-ring">TAP NOW!</div>
              </div>
            )}

            {gameState === 'result' && (
              <div className="canvas-content">
                <span className="speed-number" style={{ color: reactionEval.color }}>{reactionTime} <span style={{ fontSize: '1rem' }}>ms</span></span>
                <h4>{reactionEval.label}</h4>
                <p style={{ maxWidth: '280px', margin: '0 auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {reactionEval.advice}
                </p>
                <button className="btn-secondary" onClick={startTest}>
                  <RefreshCw size={14} /> Retry Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .drive-safety-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .checklist-card {
          padding: 1.5rem;
        }
        .drive-assessment-header {
          border-left: 5px solid;
          background: rgba(255,255,255,0.01);
          padding: 1.25rem;
          border-radius: var(--border-radius-md);
        }
        .drive-assess-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .drive-assess-title h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .drive-assess-status {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .drive-assessment-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        
        .parameters-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .param-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem !important;
        }
        .param-title {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
        }
        .param-title span {
          color: var(--text-secondary);
          font-size: 0.78rem;
        }
        .param-title strong {
          color: white;
          font-size: 0.9rem;
          margin-top: 0.1rem;
        }
        .status-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .status-pill.safe { background: var(--color-safe-bg); color: var(--color-safe); }
        .status-pill.caution { background: var(--color-caution-bg); color: var(--color-caution); }
        .status-pill.danger { background: var(--color-danger-bg); color: var(--color-danger); }

        .game-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .reaction-canvas {
          height: 280px;
          background: #04060b;
          border-color: rgba(255,255,255,0.03);
          border-radius: var(--border-radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .reaction-canvas.waiting {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.15);
        }
        .reaction-canvas.active {
          background: rgba(16, 185, 129, 0.25);
          border-color: var(--color-safe);
        }
        .canvas-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }
        .canvas-content h4 {
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }
        .canvas-content p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 250px;
        }
        .zap-glow {
          filter: drop-shadow(0 0 10px var(--color-primary-glow));
          animation: pulseGlow 1s infinite alternate;
        }
        .speed-number {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1;
        }
        .target-ring {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          animation: scaleGlow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: white;
          color: black;
          padding: 1rem 2rem;
          border-radius: 40px;
          box-shadow: 0 0 20px white;
        }
        .pulse-dots {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-danger);
          animation: bounce 1.5s infinite;
        }
        @keyframes scaleGlow {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
