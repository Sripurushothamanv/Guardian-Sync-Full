import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Bell, ShieldAlert, CheckCheck, Trash2, Info } from 'lucide-react';

export default function NotificationsScreen() {
  const { notifications, markAllNotificationsRead, clearNotifications } = useContext(AppContext);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={28} color="#06b6d4" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Safety & Fatigue Notifications</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Real-time alerts for drive safety & caffeine cutoffs</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={markAllNotificationsRead} className="glass-card" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCheck size={14} /> Mark All Read
            </button>
            <button onClick={clearNotifications} className="glass-card" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((n, i) => (
              <div key={n._id || i} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'center', backgroundColor: n.read ? 'transparent' : 'rgba(139, 92, 246, 0.15)', borderColor: n.read ? 'var(--border-glass)' : 'rgba(139, 92, 246, 0.3)' }}>
                <ShieldAlert size={20} color={n.type === 'drive_warning' ? '#ef4444' : '#f59e0b'} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.9rem', color: 'white', display: 'block' }}>{n.message}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{new Date(n.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.5)' }}>
              <Info size={32} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No new notifications at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
