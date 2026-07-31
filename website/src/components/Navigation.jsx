import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { 
  LayoutDashboard, 
  Moon, 
  Coffee, 
  Utensils, 
  Clock, 
  Activity, 
  Car, 
  Flame, 
  BarChart2, 
  Bot, 
  Target, 
  User, 
  LogOut 
} from 'lucide-react';

export default function Navigation() {
  const { logout, user } = useContext(AppContext);

  return (
    <nav className="sidebar">
      <div className="auth-logo" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.4rem' }}>GUARDIAN<span style={{ color: '#8b5cf6' }}>SYNC</span></h2>
        <p style={{ fontSize: '0.75rem' }}>Healthcare Fatigue Platform</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        <NavLink to="/" end style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <LayoutDashboard size={18} color="#8b5cf6" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/sleep" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Moon size={18} color="#6366f1" />
          <span>Sleep Tracker</span>
        </NavLink>

        <NavLink to="/caffeine" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Coffee size={18} color="#f59e0b" />
          <span>Caffeine Tracker</span>
        </NavLink>

        <NavLink to="/nutrition" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Utensils size={18} color="#10b981" />
          <span>Nutrition Tracker</span>
        </NavLink>

        <NavLink to="/shifts" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Clock size={18} color="#ec4899" />
          <span>Duty Shifts</span>
        </NavLink>

        <NavLink to="/fatigue" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Activity size={18} color="#ef4444" />
          <span>Fatigue Meter</span>
        </NavLink>

        <NavLink to="/drive-safety" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Car size={18} color="#10b981" />
          <span>Drive Safety</span>
        </NavLink>

        <NavLink to="/burnout" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Flame size={18} color="#f97316" />
          <span>Burnout Index</span>
        </NavLink>

        <NavLink to="/ai-chat" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Bot size={18} color="#06b6d4" />
          <span>AI Assistant</span>
        </NavLink>

        <NavLink to="/reports" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <BarChart2 size={18} color="#a855f7" />
          <span>Weekly Report</span>
        </NavLink>

        <NavLink to="/goals" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Target size={18} color="#14b8a6" />
          <span>Wellness Goals</span>
        </NavLink>

        <NavLink to="/profile" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <User size={18} color="#3b82f6" />
          <span>Profile</span>
        </NavLink>
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
        <button 
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#ef4444',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
