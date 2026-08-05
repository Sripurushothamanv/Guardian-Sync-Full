import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Check, User, Mail, Shield, Building, Moon, Coffee } from 'lucide-react';

export default function ProfileScreen() {
  const { user, updateProfile } = useContext(AppContext);
  const [name, setName] = useState(user?.name || 'hanuman');
  const [email, setEmail] = useState(user?.email || 'demo@guardiansync.com');
  const [role, setRole] = useState(user?.role || 'Doctor');
  const [department, setDepartment] = useState(user?.department || 'Emergency Medicine (ER)');
  const [shiftPattern, setShiftPattern] = useState('Rotating Shift Pattern (Day/Night)');
  const [sleepGoal, setSleepGoal] = useState(user?.sleepGoal?.toString() || '8');
  const [caffeineLimit, setCaffeineLimit] = useState(user?.caffeineLimit?.toString() || '400');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      name,
      email,
      role,
      department,
      shiftPattern,
      sleepGoal: Number(sleepGoal),
      caffeineLimit: Number(caffeineLimit)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Profile Header Block matching Page 7 */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(139, 92, 246, 0.25)', 
          border: '2px solid #8b5cf6',
          color: '#ffffff', 
          fontSize: '2rem',
          fontWeight: '800',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {name ? name.charAt(0).toUpperCase() : 'H'}
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.25rem 0' }}>
            {name}
          </h2>
          <span style={{ fontSize: '0.9rem', color: '#8b5cf6', fontWeight: '700' }}>
            {role}
          </span>
        </div>
      </div>

      {saved && (
        <div className="glass-card" style={{ padding: '1rem', backgroundColor: 'rgba(0, 184, 148, 0.15)', borderColor: '#00b894', color: '#00b894', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> Profile settings saved successfully.
        </div>
      )}

      {/* Profile Form matching Page 7 */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
          User Profile Settings
        </h3>

        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Full Name</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Email Address</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>
        </div>

        {/* Clinical Role / Specialty */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Clinical Role / Specialty</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value)} 
            className="input-field" 
            style={{ backgroundColor: '#161C36' }}
          >
            <option value="Doctor">Doctor</option>
            <option value="Nurse">Nurse</option>
            <option value="Paramedic">Paramedic</option>
            <option value="Resident">Resident</option>
          </select>
        </div>

        {/* Hospital Department */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Hospital Department</label>
          <div className="input-with-icon">
            <Building size={18} className="input-icon" />
            <input 
              type="text" 
              value={department} 
              onChange={e => setDepartment(e.target.value)} 
              className="input-field" 
            />
          </div>
        </div>

        {/* Primary Shift Pattern */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Primary Shift Pattern</label>
          <select 
            value={shiftPattern} 
            onChange={e => setShiftPattern(e.target.value)} 
            className="input-field" 
            style={{ backgroundColor: '#161C36' }}
          >
            <option value="Rotating Shift Pattern (Day/Night)">Rotating Shift Pattern (Day/Night)</option>
            <option value="Fixed Night Duty">Fixed Night Duty</option>
            <option value="Day Duty Only">Day Duty Only</option>
            <option value="24-Hour Call Duty">24-Hour Call Duty</option>
          </select>
        </div>

        {/* Baseline Daily Sleep Need */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Baseline Daily Sleep Need (Hours)</label>
          <div className="input-with-icon">
            <Moon size={18} className="input-icon" />
            <input 
              type="number" 
              value={sleepGoal} 
              onChange={e => setSleepGoal(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>
        </div>

        {/* Daily Caffeine Sensitivity Cap */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Daily Caffeine Sensitivity Cap (mg)</label>
          <div className="input-with-icon">
            <Coffee size={18} className="input-icon" />
            <input 
              type="number" 
              value={caffeineLimit} 
              onChange={e => setCaffeineLimit(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>
        </div>

        {/* Primary Cyan Button matching Page 7 */}
        <button 
          type="submit" 
          className="btn-cyan" 
          style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', borderRadius: '0.65rem', marginTop: '0.5rem' }}
        >
          Save Profile Changes
        </button>
      </form>

    </div>
  );
}

