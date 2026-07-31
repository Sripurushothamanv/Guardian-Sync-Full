import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Activity, Moon, Coffee, Shield, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardScreen() {
  const { dashboardData, user } = useContext(AppContext);
  const { 
    fatigueScore = 28, 
    fatigueLevel = 'Low', 
    sleepDebt = 1.5, 
    activeCaffeine = 45, 
    recoveryScore = 82,
    awakeHours = 6.2,
    driveSafety = { status: 'SAFE', color: '#10B981', advice: 'Safe to drive.' } 
  } = dashboardData || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Welcome back, <span style={{ color: '#8b5cf6' }}>{user ? user.name : 'Healthcare Worker'}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
            {user ? `${user.role} • ${user.hospital || 'General Hospital'} (${user.department || 'ICU'})` : 'Fatigue & Readiness Tracking'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>READINESS</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{recoveryScore}%</span>
          </div>
        </div>
      </div>

      {/* Safety Alert Box */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderColor: driveSafety.color, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Shield size={32} color={driveSafety.color} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>DRIVE SAFETY STATUS:</span>
            <span style={{ fontWeight: '800', color: driveSafety.color, fontSize: '0.95rem' }}>{driveSafety.status}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>{driveSafety.advice}</p>
        </div>
        <Link to="/drive-safety" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
          Details
        </Link>
      </div>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Fatigue Index */}
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>FATIGUE INDEX</span>
            <Activity size={20} color="#ef4444" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{fatigueScore}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/ 100</span>
          </div>
          <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', backgroundColor: fatigueScore >= 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: fatigueScore >= 70 ? '#ef4444' : '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {fatigueLevel} Risk Level
          </div>
        </div>

        {/* Sleep Debt */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>SLEEP DEBT (7-DAY)</span>
            <Moon size={20} color="#6366f1" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{sleepDebt}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>hrs</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Awake for {awakeHours} hrs</span>
        </div>

        {/* Active Caffeine */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>ACTIVE CAFFEINE</span>
            <Coffee size={20} color="#f59e0b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{activeCaffeine}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>mg</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>5-Hour Half-Life Decay</span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Link to="/sleep" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>Log Sleep</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Track rest duration</span>
          </div>
          <ArrowRight size={18} color="#6366f1" />
        </Link>

        <Link to="/caffeine" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>Log Coffee</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Track active caffeine</span>
          </div>
          <ArrowRight size={18} color="#f59e0b" />
        </Link>

        <Link to="/fatigue" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>Fatigue Simulator</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Simulate shift load</span>
          </div>
          <Zap size={18} color="#ef4444" />
        </Link>

        <Link to="/ai-chat" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>AI Advisor</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Context voice assistant</span>
          </div>
          <ArrowRight size={18} color="#06b6d4" />
        </Link>
      </div>
    </div>
  );
}
