import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { LogOut, Car, Phone, Bell } from 'lucide-react';

export default function SettingsScreen() {
  const { logout } = useContext(AppContext);
  const [rideService, setRideService] = useState('uber / lyft / taxi');
  const [buddyContact, setBuddyContact] = useState('+1 (555) 019-2831');
  const [highFatigueAlerts, setHighFatigueAlerts] = useState(true);
  const [bedtimeReminders, setBedtimeReminders] = useState(true);
  const [caffeineCutoff, setCaffeineCutoff] = useState(true);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Notification Preferences Section matching Page 20 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Notification Preferences
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>High Fatigue Safety Alerts</span>
            <input 
              type="checkbox" 
              checked={highFatigueAlerts} 
              onChange={e => setHighFatigueAlerts(e.target.checked)} 
              className="toggle-checkbox"
            />
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>Circadian Bedtime Reminders</span>
            <input 
              type="checkbox" 
              checked={bedtimeReminders} 
              onChange={e => setBedtimeReminders(e.target.checked)} 
              className="toggle-checkbox"
            />
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>Caffeine Cutoff Alerts</span>
            <input 
              type="checkbox" 
              checked={caffeineCutoff} 
              onChange={e => setCaffeineCutoff(e.target.checked)} 
              className="toggle-checkbox"
            />
          </div>

        </div>
      </div>

      {/* Emergency Contacts Section matching Page 20 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Emergency Contacts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
              Emergency Ride Service
            </label>
            <div className="input-with-icon">
              <Car size={18} className="input-icon" />
              <input 
                type="text" 
                value={rideService} 
                onChange={e => setRideService(e.target.value)} 
                className="input-field" 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
              On-Call Buddy Contact
            </label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input 
                type="text" 
                value={buddyContact} 
                onChange={e => setBuddyContact(e.target.value)} 
                className="input-field" 
              />
            </div>
          </div>

        </div>
      </div>

      {/* Account Actions Section matching Page 20 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Account Actions
        </h3>

        <button 
          onClick={logout} 
          style={{
            width: '100%',
            padding: '0.95rem',
            backgroundColor: '#ef4444',
            border: 'none',
            borderRadius: '0.65rem',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={18} /> Logout Account
        </button>
      </div>

    </div>
  );
}

