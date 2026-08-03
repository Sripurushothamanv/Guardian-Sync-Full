import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { Lock, Mail, Phone, Activity, AlertCircle, KeyRound } from 'lucide-react';

export default function RegisterScreen() {
  const { register, setupRecaptcha, sendPhoneOtp, confirmPhoneOtp } = useContext(AppContext);
  
  // Auth Mode: 'email' or 'phone'
  const [authMode, setAuthMode] = useState('email');

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      setupRecaptcha('recaptcha-register-container');
    }
  }, [authMode, otpSent]);

  const handleEmailSubmit = async (e) => {
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      return setError('Please enter a valid phone number with country code (e.g. +919876543210)');
    }

    setLoading(true);
    setError('');

    const recaptchaVerifier = setupRecaptcha('recaptcha-register-container');
    const res = await sendPhoneOtp(phoneNumber.trim(), recaptchaVerifier);
    setLoading(false);

    if (res.success) {
      setConfirmationResult(res.confirmationResult);
      setOtpSent(true);
    } else {
      setError(res.error || 'Failed to send OTP code');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      return setError('Please enter the 6-digit OTP code');
    }

    setLoading(true);
    setError('');

    const res = await confirmPhoneOtp(confirmationResult, otpCode.trim());
    setLoading(false);

    if (res.success) {
      navigate('/create-profile');
    } else {
      setError(res.error || 'Invalid verification code');
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
              backgroundColor: authMode === 'email' ? '#06b6d4' : 'transparent',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            ✉️ Email Sign Up
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
              backgroundColor: authMode === 'phone' ? 'var(--accent-purple)' : 'transparent',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            📱 Phone OTP Sign Up
          </button>
        </div>

        {error && (
          <div className="toast-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div id="recaptcha-register-container"></div>

        {authMode === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="auth-form">
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
        ) : (
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="form-group-auth">
                <label>Phone Number (with Country Code)</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="+919876543210 or +12025550123" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-field" 
                    required 
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', display: 'block' }}>
                  Include country code prefix e.g. +91 or +1
                </span>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" style={{ backgroundColor: '#8b5cf6' }} disabled={loading}>
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
                  OTP sent to {phoneNumber}
                </span>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" style={{ backgroundColor: '#10b981' }} disabled={loading}>
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
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
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
