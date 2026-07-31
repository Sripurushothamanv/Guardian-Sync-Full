import React, { useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Bell, ShieldAlert, Coffee, Car, Trash2, CheckCheck, Clock } from 'lucide-react';

export default function NotificationsScreen() {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearNotifications,
    fetchNotifications
  } = useContext(AppContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotifIcon = (type) => {
    if (type === 'burnout') return <ShieldAlert size={18} color="#ef4444" />;
    if (type === 'caffeine_cutoff') return <Coffee size={18} color="#06b6d4" />;
    if (type === 'drive_warning') return <Car size={18} color="#f59e0b" />;
    return <Bell size={18} color="#8b5cf6" />;
  };

  const getNotifClass = (type) => {
    if (type === 'burnout') return 'burnout-alert';
    if (type === 'caffeine_cutoff') return 'caffeine-alert';
    if (type === 'drive_warning') return 'drive-alert';
    return 'default-alert';
  };

  return (
    <div className="notifications-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Bell size={24} />
          </div>
          <div>
            <h2>Notification Alerts Log</h2>
            <p>Push alerts history for sleep debts, caffeine cutoffs, and burnout warnings.</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="header-actions">
            <button className="btn-secondary btn-small" onClick={markAllNotificationsRead}>
              <CheckCheck size={14} /> Read All
            </button>
            <button className="btn-secondary btn-small danger-btn" onClick={clearNotifications}>
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        )}
      </header>

      <div className="notifications-list glass-panel">
        {notifications.length > 0 ? (
          <div className="notif-cards-stack">
            {notifications.map(notif => (
              <div 
                key={notif._id} 
                className={`notif-card glass-card ${getNotifClass(notif.type)} ${notif.read ? 'read' : 'unread'}`}
                onClick={() => !notif.read && markNotificationRead(notif._id)}
              >
                <div className="notif-card-header">
                  <div className="notif-type-row">
                    <div className="notif-icon-sphere">
                      {getNotifIcon(notif.type)}
                    </div>
                    <strong>{notif.type.replace('_', ' ').toUpperCase()}</strong>
                  </div>
                  <span className="notif-timestamp">
                    <Clock size={12} /> {new Date(notif.timestamp || notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="notif-body-text">{notif.message}</p>
                {!notif.read && <span className="unread-dot"></span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notifications-box">
            <Bell size={36} color="var(--text-muted)" className="bell-wiggle" />
            <h3>No Active Alerts</h3>
            <p>Your biometric targets are balanced. Circadian adaptation adapting normally.</p>
          </div>
        )}
      </div>

      <style>{`
        .notifications-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .notifications-list {
          padding: 1.5rem;
          min-height: 400px;
        }
        .notif-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .notif-card {
          padding: 1.25rem !important;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .notif-card.read {
          opacity: 0.75;
        }
        .notif-card.unread {
          border-left: 4px solid var(--color-primary);
        }
        .notif-card.burnout-alert.unread { border-left-color: var(--color-danger); }
        .notif-card.caffeine-alert.unread { border-left-color: var(--color-secondary); }
        .notif-card.drive-alert.unread { border-left-color: var(--color-caution); }

        .notif-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-type-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .notif-icon-sphere {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .notif-type-row strong {
          font-size: 0.78rem;
          color: white;
          letter-spacing: 0.5px;
        }
        .notif-timestamp {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .notif-body-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .unread-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          box-shadow: 0 0 5px var(--color-primary);
        }
        .no-notifications-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
          padding: 5rem 0;
          gap: 0.75rem;
        }
        .no-notifications-box h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
        }
        .no-notifications-box p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .danger-btn {
          border-color: rgba(239,68,68,0.15) !important;
          color: #f87171 !important;
        }
        .danger-btn:hover {
          background: var(--color-danger) !important;
          color: white !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
