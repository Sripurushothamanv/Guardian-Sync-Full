import React, { useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Flame, Check, HelpCircle, Loader2 } from 'lucide-react';

export default function WellnessGoalsScreen() {
  const { goals, streakInfo, updateGoal, fetchGoals, fetchStreaks } = useContext(AppContext);

  useEffect(() => {
    fetchGoals();
    fetchStreaks();
  }, []);

  const handleUpdateProgress = async (goalId, current, target) => {
    // Add small step (e.g. +1 or +250ml)
    const step = current >= target ? 0 : 1;
    await updateGoal(goalId, { currentValue: current + step });
  };

  return (
    <div className="goals-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Flame size={24} />
          </div>
          <div>
            <h2>Daily Wellness Goals</h2>
            <p>Set targets, earn badges, and maintain your tracking streak counter.</p>
          </div>
        </div>
      </header>

      {/* Streak Dashboard Card */}
      <section className="streak-hero-card glass-panel">
        <div className="streak-content-area">
          <div className="streak-fire-globe">
            <span className="fire-emoji">🔥</span>
            <span className="streak-number">{streakInfo.streakCount}</span>
          </div>
          <div className="streak-details">
            <h3>Active Goal Streak: {streakInfo.streakCount} Days!</h3>
            <p>Complete at least one daily goal to preserve your streak fire. Consistent logging helps predict accurate wellness trends.</p>
          </div>
        </div>
      </section>

      <div className="screen-content-split">
        {/* Goals lists */}
        <div className="goals-list-panel glass-panel">
          <h3>Today's Wellness Targets</h3>
          <div className="goals-rows-stack">
            {goals.map(goal => {
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <div key={goal._id} className={`goal-card-item glass-card ${goal.completed ? 'completed-border' : ''}`}>
                  <div className="goal-card-row">
                    <div className="goal-text-info">
                      <span className={`goal-chk-indicator ${goal.completed ? 'completed' : ''}`}>
                        {goal.completed && <Check size={12} color="white" />}
                      </span>
                      <div>
                        <strong>{goal.title}</strong>
                        <p>{pct}% complete towards daily target</p>
                      </div>
                    </div>
                    <button 
                      className="btn-secondary btn-small"
                      onClick={() => handleUpdateProgress(goal._id, goal.currentValue, goal.targetValue)}
                      disabled={goal.completed}
                    >
                      {goal.completed ? 'Completed' : '+ Add Log'}
                    </button>
                  </div>

                  <div className="goal-card-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: goal.completed ? 'var(--color-safe)' : 'var(--color-primary)' }}></div>
                    </div>
                    <span>{goal.currentValue} / {goal.targetValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges Panel */}
        <div className="badges-panel glass-panel">
          <h3>Merit Badges & Achievements</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Unlock achievements by establishing healthy habits.
          </p>

          <div className="badges-grid">
            {streakInfo.badges.map(badge => (
              <div 
                key={badge.id} 
                className={`badge-box glass-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="badge-icon-sphere">
                  <span className="badge-emoji">{badge.icon}</span>
                  {!badge.unlocked && <div className="badge-lock">🔒</div>}
                </div>
                <strong>{badge.title}</strong>
                <p>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .goals-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .streak-hero-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(139, 92, 246, 0.05));
          border-color: rgba(239, 68, 68, 0.25);
        }
        .streak-content-area {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .streak-fire-globe {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 15px rgba(239,68,68,0.2);
          position: relative;
        }
        .fire-emoji {
          font-size: 1.5rem;
          line-height: 1;
        }
        .streak-number {
          font-size: 1rem;
          font-weight: 800;
          color: white;
          margin-top: -0.1rem;
        }
        .streak-details h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: white;
        }
        .streak-details p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
          line-height: 1.45;
        }

        .goals-list-panel {
          padding: 1.5rem;
        }
        .goals-rows-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        .goal-card-item {
          padding: 1rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .goal-card-item.completed-border {
          border-color: rgba(16, 185, 129, 0.25);
          background: rgba(16, 185, 129, 0.02);
        }
        .goal-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .goal-text-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .goal-chk-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .goal-chk-indicator.completed {
          background-color: var(--color-safe);
          border-color: transparent;
        }
        .goal-text-info strong {
          font-size: 0.88rem;
          color: white;
        }
        .goal-text-info p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
        }
        .goal-card-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .goal-card-progress span {
          width: 80px;
          text-align: right;
          font-weight: 600;
        }

        .badges-panel {
          padding: 1.5rem;
        }
        .badges-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
        .badge-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1.25rem !important;
          transition: var(--transition-smooth);
        }
        .badge-box.locked {
          opacity: 0.45;
          filter: grayscale(1);
        }
        .badge-box.locked:hover {
          opacity: 0.6;
          filter: none;
        }
        .badge-icon-sphere {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          position: relative;
        }
        .badge-emoji {
          font-size: 1.5rem;
        }
        .badge-lock {
          position: absolute;
          bottom: -4px;
          right: -4px;
          font-size: 0.7rem;
        }
        .badge-box strong {
          font-size: 0.85rem;
          color: white;
        }
        .badge-box p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.3;
          margin-top: 0.25rem;
        }
        @media (max-width: 576px) {
          .badges-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
