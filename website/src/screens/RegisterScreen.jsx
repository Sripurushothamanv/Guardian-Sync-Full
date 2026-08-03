import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Lock, Mail, Activity, AlertCircle } from 'lucide-react';

export default function RegisterScreen() {
  const { register } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/create-profile');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <Activity size={32} color="#06b6d4" style={{ marginBottom: '0.5rem' }} className="neon-glow-cyan" />
          <h2>Create <span>Account</span></h2>
          <p>Join Guardian-Sync to track shift fatigue & wellness</p>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-auth">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="sarah@hospital.org" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div className="form-group-auth">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="input-field" 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" style={{ backgroundColor: '#06b6d4' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Continue to Profile Setup'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
