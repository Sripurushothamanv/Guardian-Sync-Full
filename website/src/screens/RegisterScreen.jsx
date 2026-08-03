import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { User, Mail, Lock, Building, Shield, Activity, Phone, KeyRound, AlertCircle } from 'lucide-react';

export default function RegisterScreen() {
  const { register, setupRecaptcha, sendPhoneOtp, confirmPhoneOtp } = useContext(AppContext);
  
  // Auth Mode: 'email' or 'phone'
  const [authMode, setAuthMode] = useState('email');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Doctor');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');

  // Phone OTP States
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

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required');
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber || phoneNumber.length < 8) {
      return setError('Please enter your Name and a valid Phone Number with country code (e.g. +919876543210)');
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

    const res = await confirmPhoneOtp(confirmationResult, otpCode.trim(), {
      name: name.trim(),
      role,
      hospital: hospital.trim(),
      department: department.trim()
    });
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Invalid verification code');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ maxWidth: '480px' }}>
        {/* Top Logo / Icon matching screenshot */}
        <div className="auth-logo" style={{ marginBottom: '1.25rem' }}>
          <Activity size={38} color="#06b6d4" style={{ marginBottom: '0.35rem' }} className="neon-glow-cyan" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Create Profile</h2>
        </div>

        {/* Tab Switcher: Email vs Phone */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: 'rgba(12, 15, 32, 0.6)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('email'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.45rem',
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
            ✉️ Email Registration
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('phone'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.45rem',
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
            📱 Mobile Phone OTP
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
        ) : (
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="auth-form" style={{ gap: '1rem' }}>
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

              <div className="form-group-auth">
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="Mobile Number (e.g. +919876543210)" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

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

              <button 
                type="submit" 
                className="btn-primary auth-submit-btn" 
                style={{ backgroundColor: '#8b5cf6', padding: '0.85rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.5rem' }} 
                disabled={loading}
              >
                {loading ? 'Sending SMS OTP...' : 'Send OTP & Register Profile'}
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
                {loading ? 'Verifying OTP...' : 'Verify OTP & Complete Registration'}
              </button>

              <button 
                type="button" 
                onClick={() => setOtpSent(false)} 
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >
                ← Change Mobile Number
              </button>
            </form>
          )
        )}

        <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#06b6d4', fontWeight: 'bold' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
