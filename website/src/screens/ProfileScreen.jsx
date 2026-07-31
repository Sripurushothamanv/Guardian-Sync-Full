import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { User, Building, Shield, Save, Check } from 'lucide-react';

export default function ProfileScreen() {
  const { user, updateProfile } = useContext(AppContext);
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Doctor');
  const [hospital, setHospital] = useState(user?.hospital || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [sleepGoal, setSleepGoal] = useState(user?.sleepGoal?.toString() || '8');
  const [caffeineLimit, setCaffeineLimit] = useState(user?.caffeineLimit?.toString() || '400');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      name,
      role,
      hospital,
      department,
      sleepGoal: Number(sleepGoal),
      caffeineLimit: Number(caffeineLimit)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="#8b5cf6" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>{user?.name || 'Healthcare Worker'}</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{user?.email}</p>
          </div>
        </div>

        {saved && (
          <div className="glass-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={18} /> Profile settings updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Clinical Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Nurse">👩‍⚕️ Nurse</option>
                <option value="Paramedic">🚑 Paramedic</option>
                <option value="Resident">🩺 Resident</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Hospital / Clinic</label>
              <input type="text" value={hospital} onChange={e => setHospital(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Department</label>
              <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Sleep Goal (Hours/Night)</label>
              <input type="number" step="0.5" value={sleepGoal} onChange={e => setSleepGoal(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Daily Caffeine Safety Cap (mg)</label>
              <input type="number" value={caffeineLimit} onChange={e => setCaffeineLimit(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Save size={16} /> Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
