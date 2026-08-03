import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { 
  Activity, 
  Moon, 
  Coffee, 
  Utensils, 
  Clock, 
  Shield, 
  Sparkles, 
  Send, 
  Droplets, 
  Plus, 
  ArrowRight, 
  Zap, 
  Flame, 
  Car 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardScreen() {
  const { dashboardData, user, addAILog, logHydration } = useContext(AppContext);
  const [customWater, setCustomWater] = useState('250');
  const [aiInput, setAiInput] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const { 
    fatigueScore = 28, 
    fatigueLevel = 'Low', 
    sleepDebt = 1.5, 
    activeCaffeine = 45, 
    recoveryScore = 82,
    waterIntake = 1250,
    awakeHours = 6.2,
    driveSafety = { status: 'SAFE', color: '#10B981', advice: 'Safe to drive home.' },
    activeShift = null
  } = dashboardData || {};

  const waterGoal = user?.waterGoal || 3000;
  const waterPct = Math.min(100, Math.round((waterIntake / waterGoal) * 100));

  const getGaugeColor = (score) => {
    if (score >= 80) return '#EF4444'; // Red
    if (score >= 60) return '#F59E0B'; // Orange
    if (score >= 40) return '#FBBF24'; // Yellow
    return '#10B981'; // Green
  };

  const gaugeColor = getGaugeColor(fatigueScore);

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsParsing(true);
    setAiFeedback(null);
    
    const result = await addAILog(aiInput);
    setIsParsing(false);
    setAiFeedback(result);
    setAiInput('');
  };

  const handleLogWater = async (amount) => {
    const ml = amount || parseInt(customWater, 10);
    if (!ml || ml <= 0) return;
    await logHydration(ml);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Hello, <span style={{ color: '#8b5cf6' }}>{user ? user.name || 'Healthcare Worker' : 'Healthcare Worker'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
            {user ? `${user.role || 'Doctor'} • ${user.hospital || 'City General Hospital'} (${user.department || 'ICU'})` : 'Healthcare Wellness & Fatigue Tracking'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '110px' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', fontWeight: 'bold' }}>READINESS</span>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>{recoveryScore}%</span>
          </div>
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: '110px' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'block', fontWeight: 'bold' }}>HOURS AWAKE</span>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#06b6d4' }}>{awakeHours}h</span>
          </div>
        </div>
      </div>

      {/* Prominent AI Natural Language Quick Input Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={20} color="#06b6d4" className="neon-glow-cyan" />
          <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white' }}>AI Natural Language Quick Logger</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}>Type anything e.g. "Slept 7 hours and drank 2 coffees"</span>
        </div>

        <form onSubmit={handleAISubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            placeholder="Type e.g. 'Drank 2 cups of filter coffee', 'Slept 8 hours', 'Worked 12h night shift'..." 
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            className="input-field" 
            style={{ paddingLeft: '1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={isParsing} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', backgroundColor: '#06b6d4' }}>
            <Send size={16} /> {isParsing ? 'Parsing...' : 'Parse & Log'}
          </button>
        </form>

        {aiFeedback && (
          <div className="glass-card" style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: aiFeedback.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderColor: aiFeedback.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)', fontSize: '0.85rem', color: aiFeedback.success ? '#10b981' : '#ef4444' }}>
            {aiFeedback.summary}
          </div>
        )}
      </div>

      {/* Safe-to-Drive Alert Card */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderColor: driveSafety.color, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Car size={32} color={driveSafety.color} />
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>DRIVE SAFETY STATUS:</span>
            <span style={{ fontWeight: '900', color: driveSafety.color, fontSize: '1rem' }}>{driveSafety.status}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>{driveSafety.advice}</p>
        </div>
        <Link to="/drive-safety" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none' }}>
          Safety Guidelines
        </Link>
      </div>

      {/* Circular Gauge + Quick Logger Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Fatigue Index Circular SVG Gauge */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1px', alignSelf: 'flex-start', marginBottom: '1rem' }}>
            FATIGUE SCORE GAUGE
          </span>

          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke={gaugeColor} 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * (fatigueScore / 100))} 
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', display: 'block', lineHeight: '1' }}>{fatigueScore}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: gaugeColor }}>{fatigueLevel} Risk</span>
            </div>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
            Calculated from sleep debt, awake duration & caffeine decay
          </span>
        </div>

        {/* Quick Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Link to="/sleep" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Moon size={22} color="#6366f1" />
              <ArrowRight size={16} color="rgba(255,255,255,0.3)" />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Log Sleep</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Track sleep duration</span>
            </div>
          </Link>

          <Link to="/caffeine" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Coffee size={22} color="#f59e0b" />
              <ArrowRight size={16} color="rgba(255,255,255,0.3)" />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Log Coffee</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Active caffeine decay</span>
            </div>
          </Link>

          <Link to="/nutrition" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Utensils size={22} color="#10b981" />
              <ArrowRight size={16} color="rgba(255,255,255,0.3)" />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Log Nutrition</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Meals & calories</span>
            </div>
          </Link>

          <Link to="/shifts" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Clock size={22} color="#ec4899" />
              <ArrowRight size={16} color="rgba(255,255,255,0.3)" />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1rem' }}>Duty Shifts</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Night & on-call roster</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4 Health Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {/* Sleep Debt */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>SLEEP DEBT</span>
            <Moon size={18} color="#6366f1" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: '800', display: 'block' }}>{sleepDebt} hrs</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>7-day cumulative debt</span>
        </div>

        {/* Active Caffeine */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>ACTIVE CAFFEINE</span>
            <Coffee size={18} color="#f59e0b" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: '800', display: 'block' }}>{activeCaffeine} mg</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>5-hr half-life metabolism</span>
        </div>

        {/* Custom Hydration Logger Card */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>HYDRATION LOGGER</span>
            <Droplets size={18} color="#06b6d4" className="neon-glow-cyan" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{waterIntake} / {waterGoal} ml</span>
            <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 'bold' }}>{waterPct}%</span>
          </div>
          
          <div className="progress-bar-track" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-bar-fill" style={{ width: `${waterPct}%`, backgroundColor: waterPct >= 100 ? '#10b981' : '#06b6d4' }} />
          </div>

          {/* Preset Buttons + Custom Input Field + Log Water Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button type="button" onClick={() => handleLogWater(250)} style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '0.25rem', color: '#06b6d4', cursor: 'pointer' }}>
                +250ml
              </button>
              <button type="button" onClick={() => handleLogWater(500)} style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '0.25rem', color: '#06b6d4', cursor: 'pointer' }}>
                +500ml
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <input 
                type="number" 
                value={customWater} 
                onChange={e => setCustomWater(e.target.value)} 
                placeholder="ml"
                className="input-field" 
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', height: '32px', textAlign: 'center' }} 
              />
              <button 
                type="button" 
                onClick={() => handleLogWater()} 
                className="btn-primary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', height: '32px', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', backgroundColor: '#06b6d4' }}
              >
                <Plus size={14} /> Log Water
              </button>
            </div>
          </div>
        </div>

        {/* Last Sleep Recovery */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>SLEEP RECOVERY</span>
            <Zap size={18} color="#10b981" />
          </div>
          <span style={{ fontSize: '2rem', fontWeight: '800', display: 'block', color: '#10b981' }}>{recoveryScore}%</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Latest session score</span>
        </div>
      </div>

      {/* Active Shift Card */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Active Duty Roster Tracking</h3>
        {activeShift ? (
          <div className="glass-card" style={{ padding: '1rem', borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Clock size={24} color="#f59e0b" />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Working {activeShift.type} Duty Shift</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Elapsed: {activeShift.duration} hours</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>No active duty shift currently logged (Off-Duty Rest).</span>
            <Link to="/shifts" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none', backgroundColor: '#f59e0b' }}>
              Log Duty Shift
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
