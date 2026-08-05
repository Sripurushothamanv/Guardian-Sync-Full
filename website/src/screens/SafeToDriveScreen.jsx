import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Moon, Clock, Activity } from 'lucide-react';

export default function SafeToDriveScreen() {
  const { dashboardData } = useContext(AppContext);
  const { 
    driveSafety = { status: 'SAFE', color: '#00b894', advice: 'You are safe to drive. Stay hydrated.' }, 
    fatigueScore = 5, 
    lastNightSleep = 7.5, 
    awakeHours = 1.4 
  } = dashboardData || {};

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Status Card matching Page 14 */}
      <div className="glass-panel" style={{ 
        padding: '2.5rem 1.5rem', 
        textAlign: 'center', 
        borderColor: 'rgba(0, 184, 148, 0.4)', 
        backgroundColor: 'rgba(0, 184, 148, 0.08)',
        borderRadius: '1rem'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(0, 184, 148, 0.2)', 
          border: '2px solid #00b894',
          color: '#00b894', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00b894', margin: '0 0 0.5rem 0', letterSpacing: '1px' }}>
          SAFE
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
          {driveSafety.advice}
        </p>
      </div>

      {/* Readiness Parameters matching Page 14 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Readiness Parameters
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Activity size={20} color="#00b894" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Predicted Fatigue Index</span>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{fatigueScore} / 100</strong>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(0, 184, 148, 0.2)', color: '#00b894', padding: '0.35rem 0.85rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', border: '1px solid rgba(0, 184, 148, 0.4)' }}>
              PASS
            </span>
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Moon size={20} color="#00b894" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Sleep Last Session</span>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{lastNightSleep} hrs</strong>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(0, 184, 148, 0.2)', color: '#00b894', padding: '0.35rem 0.85rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', border: '1px solid rgba(0, 184, 148, 0.4)' }}>
              PASS
            </span>
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Clock size={20} color="#00b894" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Duration Awake</span>
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{awakeHours} hrs</strong>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(0, 184, 148, 0.2)', color: '#00b894', padding: '0.35rem 0.85rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.75rem', border: '1px solid rgba(0, 184, 148, 0.4)' }}>
              PASS
            </span>
          </div>
        </div>
      </div>

      {/* Result Tiers list matching Page 14 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Result Tiers
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* SAFE Tier */}
          <div className="glass-card" style={{ 
            padding: '1.25rem', 
            borderColor: 'rgba(0, 184, 148, 0.5)', 
            backgroundColor: 'rgba(0, 184, 148, 0.1)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <CheckCircle2 size={22} color="#00b894" style={{ marginTop: '0.2rem' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#00b894', display: 'block', marginBottom: '0.25rem' }}>SAFE</strong>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                All readiness parameters within safe range. You are cleared to drive.
              </span>
            </div>
          </div>

          {/* MILD CAUTION Tier */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: 0.6 }}>
            <AlertTriangle size={22} color="#ff9f43" style={{ marginTop: '0.2rem' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ff9f43', display: 'block', marginBottom: '0.25rem' }}>MILD CAUTION</strong>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                One or more parameters are borderline. Take a 15-minute power nap before driving.
              </span>
            </div>
          </div>

          {/* UNSAFE Tier */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: 0.6 }}>
            <XCircle size={22} color="#ef4444" style={{ marginTop: '0.2rem' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ef4444', display: 'block', marginBottom: '0.25rem' }}>UNSAFE</strong>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                Critical fatigue detected. Do NOT drive. Use a ride-hailing service or rest area.
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

