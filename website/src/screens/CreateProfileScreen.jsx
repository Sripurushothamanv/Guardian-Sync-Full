import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { User, Building, Shield, Activity, Stethoscope, AlertCircle } from 'lucide-react';

export default function CreateProfileScreen() {
  const { completeProfile } = useContext(AppContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !hospital.trim() || !department.trim()) {
      setError('All fields are required to complete your profile.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await completeProfile({ name, role, hospital, department });
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <Stethoscope size={36} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
          <h2>Complete Your <span>Profile</span></h2>
          <p>Set up your healthcare worker identity before accessing the dashboard</p>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-auth">
            <label>Full Name *</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Dr. Sarah Connor"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Role / Designation *</label>
            <div className="input-with-icon">
              <Shield size={16} className="input-icon" />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="input-field"
                style={{ backgroundColor: 'rgba(12, 15, 32, 0.9)' }}
              >
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Nurse">👩‍⚕️ Nurse</option>
                <option value="Paramedic">🚑 Paramedic</option>
                <option value="Resident">🩺 Resident</option>
                <option value="Surgeon">🏥 Surgeon</option>
                <option value="Technician">🔬 Technician</option>
              </select>
            </div>
          </div>

          <div className="form-group-auth">
            <label>Hospital / Clinic *</label>
            <div className="input-with-icon">
              <Building size={16} className="input-icon" />
              <input
                type="text"
                placeholder="City General Hospital"
                value={hospital}
                onChange={e => setHospital(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Department *</label>
            <div className="input-with-icon">
              <Activity size={16} className="input-icon" />
              <input
                type="text"
                placeholder="ICU / Emergency / Cardiology"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          This information helps Guardian-Sync personalize your fatigue tracking experience.
        </div>
      </div>
    </div>
  );
}
