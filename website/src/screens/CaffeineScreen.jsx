import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import AIVoiceBar from '../components/AIVoiceBar';
import { Coffee, Info, Plus, Minus, Clock, Calendar } from 'lucide-react';

export default function CaffeineScreen() {
  const { addLog, logs, dashboardData } = useContext(AppContext);
  const [beverage, setBeverage] = useState('Filter Coffee');
  const [mgPerCup, setMgPerCup] = useState(95);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const presets = [
    { name: 'Filter Coffee', mg: 95, icon: '☕' },
    { name: 'Espresso Shot', mg: 75, icon: '☕' },
    { name: 'Energy Drink', mg: 160, icon: '⚡' },
    { name: 'Green / Black Tea', mg: 47, icon: '🍵' }
  ];

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    const totalMg = mgPerCup * count;
    await addLog('caffeine', {
      beverage: `${count}x ${beverage}`,
      mgAmount: totalMg,
      timestamp: new Date()
    });
    setLoading(false);
  };

  const formatBadgeTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatBadgeDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Persistent AI Voice & Text Bar */}
      <AIVoiceBar placeholder="Speak or type e.g. 'Drank 2 cups of espresso', 'Had a red bull energy drink'..." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Coffee size={28} color="#f59e0b" className="neon-glow-amber" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Log Caffeine Intake</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>5-Hour Half-Life Exponential Decay Tracking</p>
            </div>
          </div>

          <form onSubmit={handleSubmitManual} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {presets.map((p, i) => (
                <button 
                  key={i} 
                  type="button" 
                  onClick={() => { setBeverage(p.name); setMgPerCup(p.mg); }} 
                  className="glass-card" 
                  style={{ padding: '0.85rem', border: beverage === p.name ? '1px solid #f59e0b' : '1px solid var(--border-glass)', cursor: 'pointer', textAlign: 'left', background: beverage === p.name ? 'rgba(245, 158, 11, 0.15)' : 'transparent', color: 'white' }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{p.icon}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block' }}>{p.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{p.mg} mg/serving</span>
                </button>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Serving Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="button" onClick={() => setCount(Math.max(1, count - 1))} className="glass-card" style={{ padding: '0.5rem 0.85rem', color: 'white', cursor: 'pointer' }}><Minus size={16} /></button>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{count} Serving(s)</span>
                <button type="button" onClick={() => setCount(count + 1)} className="glass-card" style={{ padding: '0.5rem 0.85rem', color: 'white', cursor: 'pointer' }}><Plus size={16} /></button>
                <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 'bold', fontSize: '1.1rem' }}>= {mgPerCup * count} mg</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ backgroundColor: '#f59e0b', color: '#0C0F20' }} disabled={loading}>
              {loading ? 'Logging...' : 'Save Caffeine Entry'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Active Decay Metabolism</h2>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b' }}>{dashboardData?.activeCaffeine || 0} mg</span>
          </div>

          <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Info size={20} color="#f59e0b" />
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              Caffeine decays with a 5-hour half-life. Active caffeine above 350mg near sleep time causes sleep fragmentation.
            </p>
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Caffeine Entry History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
            {logs.caffeine && logs.caffeine.length > 0 ? (
              logs.caffeine.map((log, i) => (
                <div key={i} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'block' }}>{log.beverage}</span>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                      <span className="badge-neon badge-time">
                        <Clock size={10} /> {formatBadgeTime(log.timestamp)}
                      </span>
                      <span className="badge-neon badge-date">
                        <Calendar size={10} /> {formatBadgeDate(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '1.1rem' }}>+{log.mgAmount} mg</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No caffeine entries recorded today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
