import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Lock, Mail, User, Shield, Briefcase, Activity, AlertCircle } from 'lucide-react';

export default function RegisterScreen() {
  const { register } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Doctor');
  const [department, setDepartment] = useState('');
  const [hospital, setHospital] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      return setError('Name, email, password, and role are required');
    }

    setLoading(true);
    setError('');

    const res = await register(name, email, password, role, department, hospital);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <Activity size={32} color="#06b6d4" className="auth-icon-spin" />
          <h2>Create Account</h2>
          <p>Join Guardian-Sync to track shift fatigue</p>
        </div>

        {error && (
          <div className="auth-error glass-card">
            <AlertCircle size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group-auth">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Dr. Sarah Connor" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group-auth">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="sarah@hospital.org" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field" 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-auth">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field" 
                  required 
                />
              </div>
            </div>

            <div className="form-group-auth">
              <label>Role</label>
              <div className="input-with-icon">
                <Shield size={16} className="input-icon" />
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', background: '#0a0e1e' }}
                >
                  <option value="Doctor">👨‍⚕️ Doctor</option>
                  <option value="Nurse">👩‍⚕️ Nurse</option>
                  <option value="Intern">🩺 Medical Intern</option>
                  <option value="Night-Shift Staff">🌙 Night-Shift Staff</option>
                  <option value="Other">Other Staff</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group-auth">
              <label>Hospital / Clinic</label>
              <div className="input-with-icon">
                <Briefcase size={16} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="City General Hospital" 
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="input-field" 
                />
              </div>
            </div>

            <div className="form-group-auth">
              <label>Department</label>
              <div className="input-with-icon">
                <Activity size={16} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="ICU / Cardiology" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field" 
                />
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
      
      <style>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
