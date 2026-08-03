import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Lock, Mail, Activity, AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useContext(AppContext);

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Email and Password are required');
    
    setLoading(true);
    setError('');
    
    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <Activity size={32} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} className="neon-glow-purple" />
          <h2>GUARDIAN<span>SYNC</span></h2>
          <p>Healthcare Wellness & Fatigue Tracking</p>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="auth-form">
          <div className="form-group-auth">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="dr.sarah@hospital.org" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div className="auth-links">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#8b5cf6' }} /> Remember Me
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
