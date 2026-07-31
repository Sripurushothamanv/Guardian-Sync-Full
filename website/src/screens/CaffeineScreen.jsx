import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Coffee, Zap, Info } from 'lucide-react';

export default function CaffeineScreen() {
  const { addLog, logs, dashboardData } = useContext(AppContext);
  const [beverage, setBeverage] = useState('Filter Coffee');
  const [amount, setAmount] = useState('95');
  const [loading, setLoading] = useState(false);

  const presets = [
    { name: 'Espresso Shot', mg: 63, icon: '☕' },
    { name: 'Filter Coffee', mg: 95, icon: '☕' },
    { name: 'Green / Black Tea', mg: 47, icon: '🍵' },
    { name: 'Energy Drink', mg: 160, icon: '⚡' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addLog('caffeine', {
      beverage,
      mgAmount: parseInt(amount, 10),
      timestamp: new Date()
    });
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Coffee size={28} color="#f59e0b" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Log Caffeine Intake</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>5-Hour Half-Life Exponential Decay Tracking</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {presets.map((p, i) => (
            <button key={i} type="button" onClick={() => { setBeverage(p.name); setAmount(p.mg.toString()); }} className="glass-card" style={{ padding: '0.85rem', border: beverage === p.name ? '1px solid #f59e0b' : '1px solid var(--border-glass)', cursor: 'pointer', textAlign: 'left', background: beverage === p.name ? 'rgba(245, 158, 11, 0.15)' : 'transparent', color: 'white' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{p.icon}</span>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}>{p.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{p.mg} mg</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Beverage Type</label>
            <input type="text" value={beverage} onChange={e => setBeverage(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Caffeine Amount (mg)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging...' : 'Log Caffeine Entry'}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Active Decay Metabolism</h2>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b' }}>{dashboardData?.activeCaffeine || 0} mg</span>
        </div>

        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
          <Info size={20} color="#f59e0b" />
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            Caffeine decays with a 5-hour half-life. High active caffeine (&gt;350mg) close to sleep time increases sleep debt.
          </p>
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Today's Caffeine Logs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
          {logs.caffeine && logs.caffeine.length > 0 ? (
            logs.caffeine.map((log, i) => (
              <div key={i} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{log.beverage}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>+{log.mgAmount} mg</span>
              </div>
            ))
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No caffeine entries recorded today.</p>
          )}
        </div>
      </div>
    </div>
  );
}
