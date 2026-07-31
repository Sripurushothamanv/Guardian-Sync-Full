import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Lock, Mail, User, Building, Shield, Activity } from 'lucide-react';

export default function RegisterScreen() {
  const { register } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Doctor');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(name, email, password, role, department, hospital);
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <Activity size={32} color="#06b6d4" style={{ marginBottom: '0.5rem' }} />
          <h2>Create <span>Account</span></h2>
          <p>Join Guardian-Sync to track shift fatigue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-auth">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input type="text" placeholder="Dr. Sarah Connor" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="sarah@hospital.org" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Role</label>
            <div className="input-with-icon">
              <Shield size={16} className="input-icon" />
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Nurse">👩‍⚕️ Nurse</option>
                <option value="Paramedic">🚑 Paramedic</option>
                <option value="Resident">🩺 Resident</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group-auth">
              <label>Hospital / Clinic</label>
              <div className="input-with-icon">
                <Building size={16} className="input-icon" />
                <input type="text" placeholder="City Hospital" value={hospital} onChange={e => setHospital(e.target.value)} className="input-field" />
              </div>
            </div>

            <div className="form-group-auth">
              <label>Department</label>
              <div className="input-with-icon">
                <Activity size={16} className="input-icon" />
                <input type="text" placeholder="ICU / Emergency" value={department} onChange={e => setDepartment(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Profile'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
