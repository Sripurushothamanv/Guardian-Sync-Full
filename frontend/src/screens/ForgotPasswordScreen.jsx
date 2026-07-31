import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Activity, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <Activity size={32} color="#8b5cf6" />
          <h2>Password Recovery</h2>
          <p>Retrieve access to your Guardian-Sync portal</p>
        </div>

        {submitted ? (
          <div className="success-recovery glass-card">
            <CheckCircle2 size={36} color="#10b981" />
            <h3>Check your email</h3>
            <p>We've sent a password reset token to <strong>{email}</strong>. Please check your inbox and spam folder.</p>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.4' }}>
              Enter the email address registered to your account. We will send a secure link to reset your password.
            </p>

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

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Recovery Email'}
            </button>

            <Link to="/login" className="back-to-login-link">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </form>
        )}
      </div>

      <style>{`
        .success-recovery {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          padding: 1.5rem;
        }
        .success-recovery h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
        }
        .success-recovery p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .back-to-login-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-size: 0.85rem;
          text-decoration: none;
          margin-top: 0.5rem;
          transition: var(--transition-smooth);
        }
        .back-to-login-link:hover {
          color: white;
        }
      `}</style>
    </div>
  );
}
