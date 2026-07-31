import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { User, Check, Shield, Briefcase, Activity, Target } from 'lucide-react';

export default function ProfileScreen() {
  const { user, updateProfile } = useContext(AppContext);
  const [name, setName] = useState(user ? user.name : '');
  const [role, setRole] = useState(user ? user.role : 'Doctor');
  const [hospital, setHospital] = useState(user ? user.hospital : '');
  const [department, setDepartment] = useState(user ? user.department : '');
  
  // Goals targets
  const [sleepGoal, setSleepGoal] = useState(user ? user.sleepGoal : 8);
  const [caffeineLimit, setCaffeineLimit] = useState(user ? user.caffeineLimit : 400);
  const [waterGoal, setWaterGoal] = useState(user ? user.waterGoal : 3000);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    await updateProfile({
      name,
      role,
      hospital,
      department,
      sleepGoal,
      caffeineLimit,
      waterGoal
    });

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="profile-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <User size={24} />
          </div>
          <div>
            <h2>My Wellness Profile</h2>
            <p>Update your department roster schedules and personalized bio-health targets.</p>
          </div>
        </div>
      </header>

      {success && (
        <div className="toast-success glass-panel">
          <Check size={18} color="var(--color-safe)" />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-grid-form">
        {/* Bio info */}
        <div className="glass-panel profile-section-card">
          <div className="section-title-row">
            <Briefcase size={18} color="var(--color-primary)" />
            <h3>Professional Identity</h3>
          </div>

          <div className="form-group-stack" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field" required
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
                style={{ background: '#0a0e1e' }}
              >
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Nurse">👩‍⚕️ Nurse</option>
                <option value="Intern">🩺 Medical Intern</option>
                <option value="Night-Shift Staff">🌙 Night-Shift Staff</option>
                <option value="Other">Other Staff</option>
              </select>
            </div>

              <div className="form-group-row">
              <div className="form-group">
                <label>Hospital / Clinic</label>
                <input 
                  type="text" value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input 
                  type="text" value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Default Shift Type</label>
              <select 
                value={user?.shiftType || 'Day'}
                onChange={(e) => updateProfile({ shiftType: e.target.value })}
                className="input-field"
                style={{ background: '#0a0e1e' }}
              >
                <option value="Day">☀️ Day Shift</option>
                <option value="Night">🌙 Night Shift</option>
                <option value="Rotating">🔄 Rotating Shift</option>
                <option value="On-Call">🩺 On-Call Duty</option>
              </select>
            </div>
          </div>

          <div className="profile-submit-area" style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .profile-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .profile-grid-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .profile-section-card {
          padding: 1.5rem;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 0.75rem;
        }
        .section-title-row h3 {
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }
        .form-group-stack {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .profile-submit-area {
          grid-column: 1 / span 2;
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .profile-grid-form {
            grid-template-columns: 1fr;
          }
          .profile-submit-area {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}
