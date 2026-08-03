import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Lock, Mail, Phone, Activity, AlertCircle, KeyRound } from 'lucide-react';

export default function LoginScreen() {
  const { login, setupRecaptcha, sendPhoneOtp, confirmPhoneOtp } = useContext(AppContext);
  
  // Auth Mode: 'email' or 'phone'
  const [authMode, setAuthMode] = useState('email');

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authMode === 'phone' && !otpSent) {
      setupRecaptcha('recaptcha-container');
    }
  }, [authMode, otpSent]);

  const formatPhoneNumber = (phone) => {
    let clean = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!clean.startsWith('+')) {
      clean = '+91' + clean;
    }
    return clean;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('All fields are required');
    
    setLoading(true);
    setError('');
    
    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone || formattedPhone.length < 12) {
      return setError('Please enter a valid 10-digit mobile number (e.g. 6382283784 or +916382283784)');
    }

    setLoading(true);
    setError('');

    const recaptchaVerifier = setupRecaptcha('recaptcha-container');
    const res = await sendPhoneOtp(formattedPhone, recaptchaVerifier);
    setLoading(false);

    if (res.success) {
      setConfirmationResult(res.confirmationResult);
      setOtpSent(true);
    } else {
      setError(res.error || 'Failed to send OTP. Please check phone number.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      return setError('Please enter the 6-digit OTP code sent to your phone');
    }

    setLoading(true);
    setError('');

    const res = await confirmPhoneOtp(confirmationResult, otpCode.trim());
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid verification code');
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

        {/* Tab Switcher: Email vs Phone */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: 'rgba(12, 15, 32, 0.6)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: authMode === 'email' ? 'var(--accent-purple)' : 'transparent',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            ✉️ Email Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('phone'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: authMode === 'phone' ? '#06b6d4' : 'transparent',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            📱 Phone OTP
          </button>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div id="recaptcha-container"></div>

        {authMode === 'email' ? (
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
        ) : (
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group-auth">
                <label>Phone Number (e.g. 6382283784 or +916382283784)</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="6382283784" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-field" 
                    required 
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', display: 'block' }}>
                  Auto-formats 10-digit mobile numbers with +91 country code
                </span>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" style={{ backgroundColor: '#06b6d4' }} disabled={loading}>
                {loading ? 'Sending OTP Code...' : 'Send SMS Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group-auth">
                <label>6-Digit OTP Verification Code</label>
                <div className="input-with-icon">
                  <KeyRound size={16} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="123456" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="input-field" 
                    maxLength={6}
                    required 
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', display: 'block' }}>
                  OTP sent to {formatPhoneNumber(phoneNumber)}
                </span>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" style={{ backgroundColor: '#10b981' }} disabled={loading}>
                {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
              </button>

              <button 
                type="button" 
                onClick={() => setOtpSent(false)} 
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                ← Change Phone Number
              </button>
            </form>
          )
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
