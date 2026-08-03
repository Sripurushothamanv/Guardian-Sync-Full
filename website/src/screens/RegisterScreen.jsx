import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { User, Mail, Lock, Building, Shield, Activity, AlertCircle } from 'lucide-react';

export default function RegisterScreen() {
  const { register } = useContext(AppContext);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Doctor');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Full Name, Email, and Password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register(
      name.trim(),
      email.trim(),
      password,
      role,
      hospital.trim(),
      department.trim()
    );
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ maxWidth: '480px' }}>
        {/* Top Logo / Icon matching screenshot */}
        <div className="auth-logo" style={{ marginBottom: '1.5rem' }}>
          <Activity size={38} color="#06b6d4" style={{ marginBottom: '0.35rem' }} className="neon-glow-cyan" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Create Profile</h2>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailRegister} className="auth-form" style={{ gap: '1rem' }}>
          {/* Full Name */}
          <div className="form-group-auth">
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group-auth">
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group-auth">
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          {/* Role Selector matching dropdown screenshot */}
          <div className="form-group-auth">
            <div className="input-with-icon">
              <Shield size={16} className="input-icon" />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="input-field"
                style={{ backgroundColor: '#161C36' }}
              >
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Nurse">👩‍⚕️ Nurse</option>
                <option value="Intern">🩺 Medical Intern</option>
                <option value="Night-Shift Staff">🌙 Night-Shift Staff</option>
                <option value="Paramedic">🚑 Paramedic</option>
                <option value="Surgeon">🏥 Surgeon</option>
                <option value="Technician">🔬 Technician</option>
              </select>
            </div>
          </div>

          {/* Hospital / Clinic */}
          <div className="form-group-auth">
            <div className="input-with-icon">
              <Building size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Hospital / Clinic" 
                value={hospital} 
                onChange={e => setHospital(e.target.value)} 
                className="input-field" 
              />
            </div>
          </div>

          {/* Department */}
          <div className="form-group-auth">
            <div className="input-with-icon">
              <Activity size={16} className="input-icon" />
              <input 
                type="text" 
                placeholder="Department" 
                value={department} 
                onChange={e => setDepartment(e.target.value)} 
                className="input-field" 
              />
            </div>
          </div>

          {/* Register Profile Button matching screenshot */}
          <button 
            type="submit" 
            className="btn-primary auth-submit-btn" 
            style={{ backgroundColor: '#06b6d4', padding: '0.85rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem' }} 
            disabled={loading}
          >
            {loading ? 'Creating Profile...' : 'Register Profile'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#06b6d4', fontWeight: 'bold' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
