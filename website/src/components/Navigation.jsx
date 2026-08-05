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
  ShieldAlert, 
  BarChart2, 
  Mic, 
  FileText, 
  Target, 
  User, 
  LogOut,
  BrainCircuit,
  Flame
} from 'lucide-react';

export default function Navigation() {
  const { logout, user } = useContext(AppContext);

  const userName = user?.name || 'hanuman';
  const userRole = user?.role || 'Doctor';
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <nav className="sidebar">
      {/* Profile Header Header block matching Page 5 of PDF */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        paddingBottom: '1.25rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: '#8b5cf6',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '1.25rem',
          boxShadow: '0 0 14px rgba(139, 92, 246, 0.4)'
        }}>
          {userInitials}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
            {userName}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            {userRole}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        <NavLink to="/" end style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <LayoutDashboard size={18} color="#8b5cf6" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/sleep" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Moon size={18} color="#8b5cf6" />
          <span>Sleep Logs</span>
        </NavLink>

        <NavLink to="/caffeine" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Coffee size={18} color="#00bcd4" />
          <span>Caffeine Track</span>
        </NavLink>

        <NavLink to="/nutrition" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Utensils size={18} color="#00b894" />
          <span>Nutrition & Macros</span>
        </NavLink>

        <NavLink to="/shifts" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Clock size={18} color="#ff9f43" />
          <span>Shift Roster</span>
        </NavLink>

        <div style={{ height: '1px', backgroundColor: 'var(--border-glass)', margin: '0.5rem 0' }} />

        <NavLink to="/fatigue" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Activity size={18} color="#a855f7" />
          <span>Fatigue Meter</span>
        </NavLink>

        <NavLink to="/drive-safety" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Car size={18} color="#00bcd4" />
          <span>Drive Safety Check</span>
        </NavLink>

        <NavLink to="/burnout" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <ShieldAlert size={18} color="#ef4444" />
          <span>Burnout Risk Index</span>
        </NavLink>

        <NavLink to="/sleep-analyzer" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <BarChart2 size={18} color="#ff9f43" />
          <span>Sleep Analyzer</span>
        </NavLink>

        <NavLink to="/recovery" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Flame size={18} color="#ff9f43" />
          <span>Recovery suggestions</span>
        </NavLink>

        <div style={{ height: '1px', backgroundColor: 'var(--border-glass)', margin: '0.5rem 0' }} />

        <NavLink to="/ai-chat" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Mic size={18} color="#00bcd4" />
          <span>AI Voice Assistant</span>
        </NavLink>

        <NavLink to="/reports" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <FileText size={18} color="#ffffff" />
          <span>Weekly Summary</span>
        </NavLink>

        <NavLink to="/goals" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <Target size={18} color="#ffc107" />
          <span>Wellness Goals</span>
        </NavLink>

        <NavLink to="/profile" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', textDecoration: 'none', color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)', backgroundColor: isActive ? 'rgba(139, 92, 246, 0.2)' : 'transparent', fontWeight: isActive ? '600' : '400'
        })}>
          <User size={18} color="#8b5cf6" />
          <span>Profile</span>
        </NavLink>
      </div>

      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', marginTop: '0.5rem' }}>
        <button 
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#ef4444',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

