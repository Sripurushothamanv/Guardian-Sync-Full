import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { 
  Activity, 
  Moon, 
  Coffee, 
  Utensils, 
  Clock, 
  Droplets, 
  Plus, 
  Zap, 
  Car,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardScreen() {
  const { dashboardData, user, logHydration } = useContext(AppContext);
  const [customWater, setCustomWater] = useState('250');

  const { 
    fatigueScore = 5, 
    fatigueLevel = 'Low', 
    sleepDebt = 1.0, 
    activeCaffeine = 0, 
    recoveryScore = 85,
    waterIntake = 0,
    driveSafety = { status: 'SAFE', color: '#00b894', advice: 'You are safe to drive. Stay hydrated.' },
    activeShift = null
  } = dashboardData || {};

  const waterGoal = user?.waterGoal || 3000;
  const waterPct = Math.min(100, Math.round((waterIntake / waterGoal) * 100));

  const handleLogWater = async (amount) => {
    const ml = amount || parseInt(customWater, 10);
    if (!ml || ml <= 0) return;
    await logHydration(ml);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Greeting block matching Page 3 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
            Hello, {user ? user.name || 'hanuman' : 'hanuman'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {user ? `${user.role || 'Doctor'} | ${user.department || 'ICU'}` : 'Doctor | ICU'}
          </p>
        </div>
      </div>

      {/* Drive Safety Status Banner matching Page 3 */}
      <div className="glass-panel" style={{ 
        padding: '1.25rem 1.5rem', 
        borderColor: 'rgba(0, 184, 148, 0.4)', 
        backgroundColor: 'rgba(0, 184, 148, 0.08)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderRadius: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '0.75rem', 
            backgroundColor: 'rgba(0, 184, 148, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#00b894'
          }}>
            <Car size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#00b894', letterSpacing: '0.5px' }}>
              DRIVE SAFETY: {driveSafety.status}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.2rem' }}>
              {driveSafety.advice}
            </p>
          </div>
        </div>
        <Link to="/drive-safety" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
          <ChevronRight size={22} />
        </Link>
      </div>

      {/* Row 1: Fatigue Score Gauge + 4 Quick Navigation Action Cards matching Page 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        {/* Fatigue Score Circular Gauge Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: '700', alignSelf: 'flex-start', marginBottom: '1rem' }}>
            Fatigue Score
          </span>

          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="62" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="transparent" />
              <circle 
                cx="75" 
                cy="75" 
                r="62" 
                stroke="#00b894" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={390}
                strokeDashoffset={390 - (390 * (fatigueScore / 100))} 
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', display: 'block', lineHeight: '1' }}>{fatigueScore}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#00b894', marginTop: '0.2rem', display: 'block' }}>{fatigueLevel}</span>
            </div>
          </div>

          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
            Score: {fatigueScore}/100
          </span>
        </div>

        {/* 4 Quick Action Cards 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Link to="/sleep" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '0.6rem' }}>
              <Moon size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem', fontWeight: '700' }}>Sleep</strong>
          </Link>

          <Link to="/caffeine" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(0, 188, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00bcd4', marginBottom: '0.6rem' }}>
              <Coffee size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem', fontWeight: '700' }}>Caffeine</strong>
          </Link>

          <Link to="/nutrition" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(0, 184, 148, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b894', marginBottom: '0.6rem' }}>
              <Utensils size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem', fontWeight: '700' }}>Nutrition</strong>
          </Link>

          <Link to="/shifts" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(255, 159, 67, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9f43', marginBottom: '0.6rem' }}>
              <Clock size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem', fontWeight: '700' }}>Shifts</strong>
          </Link>
        </div>
      </div>

      {/* Row 2: 4 Health Metric Cards matching Page 3 & 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* Sleep Debt */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Sleep Debt</span>
            <Moon size={18} color="#8b5cf6" />
          </div>
          <span style={{ fontSize: '1.85rem', fontWeight: '800', display: 'block' }}>{sleepDebt.toFixed(1)} hrs</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', display: 'block' }}>Last 7 days</span>
        </div>

        {/* Active Caffeine */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Active Caffeine</span>
            <Coffee size={18} color="#00bcd4" />
          </div>
          <span style={{ fontSize: '1.85rem', fontWeight: '800', display: 'block' }}>{activeCaffeine} mg</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', display: 'block' }}>Curfew checks</span>
        </div>

        {/* Hydration Today */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Hydration Today</span>
            <Droplets size={18} color="#00bcd4" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', display: 'block', marginBottom: '0.75rem' }}>
            {waterIntake} / {waterGoal} ml
          </span>

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => handleLogWater(250)} style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(0, 184, 148, 0.15)', border: '1px solid rgba(0, 184, 148, 0.3)', borderRadius: '0.35rem', color: '#00b894', cursor: 'pointer' }}>
              +250ml
            </button>
            <button type="button" onClick={() => handleLogWater(500)} style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(0, 184, 148, 0.15)', border: '1px solid rgba(0, 184, 148, 0.3)', borderRadius: '0.35rem', color: '#00b894', cursor: 'pointer' }}>
              +500ml
            </button>
            <button type="button" onClick={() => handleLogWater(200)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(0, 188, 212, 0.15)', border: '1px solid rgba(0, 188, 212, 0.3)', borderRadius: '0.35rem', color: '#00bcd4', cursor: 'pointer' }}>
              +Custom
            </button>
          </div>
        </div>

        {/* Last Sleep Recovery */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Last Sleep Recovery</span>
            <Zap size={18} color="#ff9f43" />
          </div>
          <span style={{ fontSize: '1.85rem', fontWeight: '800', display: 'block' }}>{recoveryScore}%</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', display: 'block' }}>Session score</span>
        </div>
      </div>

      {/* Active Roster Tracking matching Page 4 */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', color: '#ffffff' }}>
          Active Roster Tracking
        </h3>
        {activeShift ? (
          <div className="glass-card" style={{ padding: '1rem', borderColor: '#ff9f43', backgroundColor: 'rgba(255, 159, 67, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Clock size={24} color="#ff9f43" />
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Working {activeShift.type} Duty Shift</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Elapsed: {activeShift.duration} hours</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>No active duty shift logged.</span>
            <Link to="/shifts" className="btn-orange" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none', borderRadius: '0.6rem' }}>
              Log Shift
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

