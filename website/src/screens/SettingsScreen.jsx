import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Settings, Shield, Bell, Moon, LogOut } from 'lucide-react';

export default function SettingsScreen() {
  const { logout, user } = useContext(AppContext);

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Settings size={28} color="#8b5cf6" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>System Preferences & Settings</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Manage theme, notifications & cloud account</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Dark Glassmorphism Theme</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>High contrast biomedical dark mode</span>
            </div>
            <input type="checkbox" defaultChecked disabled style={{ transform: 'scale(1.2)' }} />
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Real-Time Drive Safety Alerts</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Warn if fatigue exceeds 70/100 at shift end</span>
            </div>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Caffeine Cutoff Notifications</strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Alert 6 hours before scheduled sleep</span>
            </div>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem' }}>Firebase Cloud Synchronization</strong>
              <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Connected to guardian-sync-4694f</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', fontWeight: 'bold' }}>ACTIVE</span>
          </div>
        </div>

        <button onClick={logout} style={{ marginTop: '2rem', width: '100%', padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Sign Out of Account
        </button>
      </div>
    </div>
  );
}
