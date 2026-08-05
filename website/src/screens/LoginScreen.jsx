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
      <div className="auth-card glass-panel" style={{ maxWidth: '440px' }}>
        <div className="auth-logo" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '1rem', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '0.75rem' }}>
            <Activity size={36} color="#8b5cf6" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '1px' }}>GUARDIAN-SYNC</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Healthcare Fatigue Tracking</p>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="auth-form">
          <div className="form-group-auth">
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div className="form-group-auth">
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field" 
                required 
              />
            </div>
          </div>

          <div className="auth-links" style={{ justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ color: '#00bcd4', fontWeight: '600' }}>Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className="btn-purple auth-submit-btn" 
            style={{ padding: '0.85rem', fontSize: '1.05rem', fontWeight: '700', borderRadius: '0.65rem' }} 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#8b5cf6', fontWeight: '700' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

