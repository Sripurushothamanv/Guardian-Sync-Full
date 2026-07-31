import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { ShieldAlert, Car, CheckCircle2, AlertTriangle, XCircle, Moon, Clock } from 'lucide-react';

export default function SafeToDriveScreen() {
  const { dashboardData } = useContext(AppContext);
  const { driveSafety = { status: 'SAFE', color: '#10B981', advice: 'Safe to drive.' }, fatigueScore = 28, lastNightSleep = 7.2, awakeHours = 6.2 } = dashboardData || {};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: driveSafety.color, backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
        <Car size={64} color={driveSafety.color} style={{ margin: '0 auto 1rem' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px' }}>SAFE TO DRIVE EVALUATION</span>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: driveSafety.color, margin: '0.5rem 0' }}>{driveSafety.status}</h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
          {driveSafety.advice}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>FATIGUE INDEX</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{fatigueScore} / 100</span>
          </div>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>LAST SLEEP</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lastNightSleep} hrs</span>
          </div>
          <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>HOURS AWAKE</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{awakeHours} hrs</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Safety Rules & Guidelines</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <XCircle size={20} color="#ef4444" />
            <span style={{ fontSize: '0.9rem' }}><strong>UNSAFE:</strong> Fatigue Score ≥ 70, Last Sleep &lt; 5 hrs, or Awake &gt; 18 hrs. Do NOT drive home!</span>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span style={{ fontSize: '0.9rem' }}><strong>CAUTION:</strong> Fatigue Score ≥ 55, Last Sleep &lt; 6.5 hrs, or Awake ≥ 15 hrs. Take a 15-min power nap first.</span>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem' }}><strong>SAFE:</strong> Readiness index is clear. Stay hydrated and drive safely.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
