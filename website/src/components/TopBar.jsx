import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Menu, Bell, Settings, Sparkles, Activity } from 'lucide-react';

export default function TopBar({ onToggleSidebar }) {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <button 
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem'
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={24} />
        </button>

        <div 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer'
          }}
        >
          <div style={{
            background: 'rgba(0, 188, 212, 0.15)',
            border: '1px solid rgba(0, 188, 212, 0.4)',
            borderRadius: '0.5rem',
            padding: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00bcd4'
          }}>
            <Activity size={20} />
          </div>
          <span style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontWeight: '800', 
            fontSize: '1.25rem', 
            letterSpacing: '1px',
            color: '#ffffff'
          }}>
            GUARDIAN<span style={{ color: '#00bcd4' }}>-SYNC</span>
          </span>
        </div>
      </div>

      <div className="topbar-actions">
        <button 
          onClick={() => navigate('/ai-chat')}
          className="btn-ai-log"
        >
          <Sparkles size={16} color="#00bcd4" />
          <span>+ AI Log</span>
        </button>

        <button 
          onClick={() => navigate('/notifications')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#00bcd4'
          }} />
        </button>

        <button 
          onClick={() => navigate('/settings')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="System Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
