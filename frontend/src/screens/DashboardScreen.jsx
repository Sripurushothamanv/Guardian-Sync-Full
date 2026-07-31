import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { 
  Car, Moon, Coffee, Apple, Clock, Flame, Bell, Sparkles, 
  ChevronRight, Brain, AlertTriangle, CheckCircle2, ShieldAlert
} from 'lucide-react';

export default function DashboardScreen() {
  const { user, dashboardData, goals, fetchDashboard } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const { 
    fatigueScore, fatigueLevel, sleepDebt, activeCaffeine, 
    recoveryScore, waterIntake, driveSafety, activeShift 
  } = dashboardData;

  // Circle SVG metrics
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, fatigueScore) / 100) * circumference;

  // Determine fatigue color theme
  const getFatigueColor = (score) => {
    if (score >= 80) return '#ef4444'; // Red
    if (score >= 60) return '#f59e0b'; // Orange
    if (score >= 40) return '#fbbf24'; // Yellow
    return '#10b981'; // Green
  };

  const fatigueColor = getFatigueColor(fatigueScore);

  const quickActions = [
    { label: 'Log Sleep', path: '/sleep', icon: Moon, color: '#8b5cf6' },
    { label: 'Log Caffeine', path: '/caffeine', icon: Coffee, color: '#06b6d4' },
    { label: 'Log Meal', path: '/nutrition', icon: Apple, color: '#10b981' },
    { label: 'Log Shift', path: '/shifts', icon: Clock, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header Profile Section */}
      <header className="dashboard-header-bar">
        <div className="welcome-area">
          <h1>Hello, {user ? user.name : 'Doctor'}</h1>
          <p>{user ? `${user.role} | ${user.hospital || 'Guardian Hospital'}` : 'Healthcare Wellness Command Center'}</p>
        </div>
        <Link to="/ai-chat" className="dashboard-ai-pill glass-panel">
          <Sparkles size={16} color="#06b6d4" />
          <span>Quick Log with AI</span>
          <ChevronRight size={14} />
        </Link>
      </header>

      {/* 1. Safe-To-Drive Alert Banner */}
      <section 
        className="drive-banner glass-panel" 
        style={{ borderLeft: `6px solid ${driveSafety.color}` }}
      >
        <div className="drive-banner-icon" style={{ backgroundColor: `${driveSafety.color}15` }}>
          <Car color={driveSafety.color} size={28} />
        </div>
        <div className="drive-banner-content">
          <div className="drive-header-row">
            <h3>DRIVING READINESS: <span style={{ color: driveSafety.color }}>{driveSafety.status}</span></h3>
            <span className="drive-badge" style={{ backgroundColor: `${driveSafety.color}20`, color: driveSafety.color }}>
              Fatigue Level {fatigueLevel}
            </span>
          </div>
          <p>{driveSafety.advice}</p>
        </div>
        <button className="drive-test-btn btn-secondary" onClick={() => navigate('/drive-safety')}>
          Reaction Test
        </button>
      </section>

      {/* Circular Fatigue score + Quick Action Logs */}
      <div className="dashboard-row-split">
        {/* Giant Fatigue Meter Gauge */}
        <div className="gauge-card glass-panel">
          <div className="card-header">
            <h3>Predicted Fatigue Index</h3>
            <span className="info-tooltip">Real-time</span>
          </div>

          <div className="gauge-container">
            <svg height={radius * 2} width={radius * 2} className="gauge-svg">
              <circle
                stroke="rgba(255,255,255,0.05)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={fatigueColor}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="gauge-circle-progress"
              />
            </svg>
            <div className="gauge-text">
              <span className="gauge-score" style={{ textShadow: `0 0 15px ${fatigueColor}40` }}>{fatigueScore}</span>
              <span className="gauge-max">/100</span>
              <span className="gauge-label" style={{ color: fatigueColor }}>{fatigueLevel} Fatigue</span>
            </div>
          </div>

          <p className="gauge-explanation">
            Based on {sleepDebt}h sleep debt, {dashboardData.awakeHours}h since last sleep, and {activeCaffeine}mg active caffeine.
          </p>
        </div>

        {/* Quick Log Buttons */}
        <div className="quick-logs-card glass-panel">
          <h3>Quick Health Loggers</h3>
          <p>Instantly log data to update metrics and recalculate driving safety.</p>
          
          <div className="quick-actions-grid">
            {quickActions.map(act => {
              const ActIcon = act.icon;
              return (
                <button 
                  key={act.label} 
                  className="quick-action-btn glass-card"
                  onClick={() => navigate(act.path)}
                >
                  <div className="act-icon-sphere" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                    <ActIcon size={22} />
                  </div>
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>

          <Link to="/ai-chat" className="ai-chat-banner glass-card">
            <div className="ai-icon-holder">
              <Sparkles size={20} color="white" />
            </div>
            <div className="ai-banner-text">
              <h4>Full AI Voice & Chat Log</h4>
              <p>"Finished a night shift, had a banana, slept 4 hrs"</p>
            </div>
            <ChevronRight size={18} color="var(--text-secondary)" />
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <section className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-card-header">
            <span>Sleep Debt</span>
            <Moon size={18} color="#8b5cf6" />
          </div>
          <div className="metric-value">
            {sleepDebt} <span>hrs</span>
          </div>
          <div className="metric-footer">
            <span className={sleepDebt > 4 ? 'status-danger' : sleepDebt > 2 ? 'status-caution' : 'status-safe'}>
              {sleepDebt > 4 ? 'High sleep debt' : sleepDebt > 2 ? 'Moderate debt' : 'Good recovery'}
            </span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-card-header">
            <span>Active Caffeine</span>
            <Coffee size={18} color="#06b6d4" />
          </div>
          <div className="metric-value">
            {activeCaffeine} <span>mg</span>
          </div>
          <div className="metric-footer">
            <span>Half-life decaying in system</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-card-header">
            <span>Hydration Today</span>
            <Apple size={18} color="#10b981" />
          </div>
          <div className="metric-value">
            {waterIntake} <span>ml</span>
          </div>
          <div className="metric-footer">
            <span>Target: {user ? user.waterGoal : 3000} ml</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-card-header">
            <span>Recent Recovery</span>
            <Flame size={18} color="#f59e0b" />
          </div>
          <div className="metric-value">
            {recoveryScore}<span>%</span>
          </div>
          <div className="metric-footer">
            <span>Last Sleep Score</span>
          </div>
        </div>
      </section>

      {/* Shifts & Goals Row */}
      <div className="dashboard-row-split" style={{ marginTop: '2rem' }}>
        {/* Active Shift details */}
        <div className="shift-card-panel glass-panel">
          <h3>Current Active Roster</h3>
          {activeShift ? (
            <div className="active-shift-details glass-card" style={{ borderLeft: '4px solid var(--color-caution)' }}>
              <Clock size={24} color="var(--color-caution)" />
              <div>
                <h4>Working {activeShift.type} Shift</h4>
                <p>Shift started at: {new Date(activeShift.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>Elapsed Time: <strong>{activeShift.duration} hrs</strong></p>
              </div>
            </div>
          ) : (
            <div className="no-active-shift glass-card">
              <Clock size={20} color="var(--text-muted)" />
              <p>No active shift logged. Log starting shifts for exact roster tracking.</p>
              <button className="btn-secondary btn-small" onClick={() => navigate('/shifts')}>Log Shift</button>
            </div>
          )}
        </div>

        {/* Daily Goals Summary */}
        <div className="goals-card-panel glass-panel">
          <div className="panel-header-row">
            <h3>Daily Goals</h3>
            <Link to="/goals">All Goals</Link>
          </div>
          <div className="goals-summary-list">
            {goals.slice(0, 3).map(goal => (
              <div key={goal._id} className="goal-row-item">
                <div className="goal-row-info">
                  <span className={`goal-status-dot ${goal.completed ? 'completed' : ''}`}></span>
                  <span>{goal.title}</span>
                </div>
                <span className="goal-progress-badge">
                  {goal.currentValue} / {goal.targetValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .dashboard-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .welcome-area h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
        }
        .welcome-area p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .dashboard-ai-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          color: white;
          cursor: pointer;
        }
        .drive-banner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem 1.5rem;
          border-radius: var(--border-radius-lg);
        }
        .drive-banner-icon {
          width: 54px;
          height: 54px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drive-banner-content {
          flex: 1;
        }
        .drive-header-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.25rem;
        }
        .drive-header-row h3 {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .drive-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .drive-banner-content p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .drive-test-btn {
          font-size: 0.82rem;
          padding: 0.6rem 1rem !important;
        }
        
        .dashboard-row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .gauge-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .card-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .info-tooltip {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          background: rgba(255,255,255,0.04);
          padding: 0.2rem 0.5rem;
          border-radius: 30px;
        }
        .gauge-container {
          position: relative;
          width: 160px;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gauge-svg {
          transform: rotate(-90deg);
        }
        .gauge-circle-progress {
          transition: stroke-dashoffset 0.8s ease-in-out;
        }
        .gauge-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .gauge-score {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }
        .gauge-max {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }
        .gauge-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .gauge-explanation {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-align: center;
          margin-top: 1.5rem;
          line-height: 1.4;
        }

        .quick-logs-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .quick-logs-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .quick-logs-card p {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 0.5rem 0;
        }
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem !important;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .act-icon-sphere {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .quick-action-btn span {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ai-chat-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px dashed rgba(6, 182, 212, 0.4);
          cursor: pointer;
          text-decoration: none;
          padding: 0.75rem 1rem;
          margin-top: 0.25rem;
        }
        .ai-chat-banner:hover {
          border-color: var(--color-secondary);
        }
        .ai-icon-holder {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px var(--color-secondary-glow);
        }
        .ai-banner-text {
          flex: 1;
        }
        .ai-banner-text h4 {
          font-size: 0.82rem;
          font-weight: 700;
          color: white;
        }
        .ai-banner-text p {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-top: 1.5rem;
        }
        .metric-card {
          padding: 1.25rem;
        }
        .metric-card-header {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .metric-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .metric-value span {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .metric-footer {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .status-danger { color: #f87171; }
        .status-caution { color: #fbbf24; }
        .status-safe { color: #34d399; }

        .shift-card-panel, .goals-card-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .shift-card-panel h3, .goals-card-panel h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .panel-header-row a {
          color: var(--color-primary);
          font-size: 0.8rem;
          text-decoration: none;
          font-weight: 600;
        }
        .active-shift-details {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .active-shift-details h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
        }
        .active-shift-details p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
        }
        .no-active-shift {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
          padding: 1.5rem;
        }
        .no-active-shift p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .btn-small {
          padding: 0.4rem 0.8rem !important;
          font-size: 0.75rem;
        }
        .goals-summary-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .goal-row-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          background: rgba(255,255,255,0.01);
          padding: 0.5rem 0.75rem;
          border-radius: var(--border-radius-md);
        }
        .goal-row-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .goal-status-dot {
          width: 8px;
          height: 8px;
          background-color: var(--text-muted);
          border-radius: 50%;
        }
        .goal-status-dot.completed {
          background-color: var(--color-safe);
          box-shadow: 0 0 5px var(--color-safe);
        }
        .goal-progress-badge {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Mobile Breakpoints */
        @media (max-width: 992px) {
          .dashboard-row-split {
            grid-template-columns: 1fr;
          }
          .metrics-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 576px) {
          .drive-banner {
            flex-direction: column;
            text-align: center;
          }
          .drive-header-row {
            justify-content: center;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
