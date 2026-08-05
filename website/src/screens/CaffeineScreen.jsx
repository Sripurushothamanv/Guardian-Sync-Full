import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Coffee, Plus, Minus, Clock, Calendar, Sparkles } from 'lucide-react';

export default function CaffeineScreen() {
  const { addLog, logs, dashboardData } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  const [beverage, setBeverage] = useState('Filter Coffee');
  const [mgPerCup, setMgPerCup] = useState(95);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const presets = [
    { name: 'Filter Coffee', mg: 95, desc: '~95mg', icon: '☕' },
    { name: 'Espresso', mg: 75, desc: '~75mg', icon: '☕' },
    { name: 'Energy Drink', mg: 80, desc: '~80mg', icon: '🥤' },
    { name: 'Tea', mg: 30, desc: '~30mg', icon: '🍵' }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Tab Bar matching Page 10 */}
      <div className="tabs-header" style={{ justifyContent: 'center' }}>
        <button 
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <span>✍️ Manual Log</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Sparkles size={16} color="#00bcd4" />
          <span>🤖 AI Parser</span>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.25rem', color: '#ffffff' }}>
              Select Beverage Type
            </h2>

            {/* Beverage Grid matching Page 10 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
              {presets.map((p, i) => {
                const isSelected = beverage === p.name;
                return (
                  <div 
                    key={i} 
                    onClick={() => { setBeverage(p.name); setMgPerCup(p.mg); }} 
                    className="glass-card" 
                    style={{ 
                      padding: '1.25rem 1rem', 
                      border: isSelected ? '2px solid #00bcd4' : '1px solid var(--border-glass)', 
                      cursor: 'pointer', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      background: isSelected ? 'rgba(0, 188, 212, 0.12)' : 'var(--bg-card-solid)',
                      borderRadius: '0.75rem'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{p.icon}</span>
                    <div>
                      <strong style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{p.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Number of Servings Stepper matching Page 10 */}
            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: '0.75rem' }}>
                Number of Servings
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.75rem', marginBottom: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setCount(Math.max(1, count - 1))} 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-glass)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>{count}</span>
                <button 
                  type="button" 
                  onClick={() => setCount(count + 1)} 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#00bcd4',
                    color: 'black',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(0, 188, 212, 0.4)'
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                Serving Size: <strong>{count} cup ({mgPerCup * count} mg)</strong>
              </span>
            </div>

            {/* Date & Time Logged matching Page 10 */}
            <div style={{ marginBottom: '1.75rem' }}>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                Date & Time Logged
              </span>
              <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(0, 188, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00bcd4' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Log Timestamp</span>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                    {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Primary Cyan Button matching Page 10 */}
            <button 
              onClick={handleSubmitManual} 
              className="btn-cyan" 
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '0.65rem' }} 
              disabled={loading}
            >
              {loading ? 'Logging...' : 'Log Caffeine'}
            </button>
          </div>

          {/* Side Metabolism Details */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Active Caffeine Level</h2>
              <span style={{ fontSize: '1.85rem', fontWeight: '900', color: '#00bcd4' }}>{dashboardData?.activeCaffeine || 0} mg</span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.85rem' }}>Today's Logged Drinks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
              {logs.caffeine && logs.caffeine.length > 0 ? (
                logs.caffeine.map((log, i) => (
                  <div key={i} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', display: 'block', color: '#ffffff' }}>{log.beverage}</span>
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                        <span className="badge-neon badge-time">
                          <Clock size={10} /> {formatBadgeTime(log.timestamp)}
                        </span>
                        <span className="badge-neon badge-date">
                          <Calendar size={10} /> {formatBadgeDate(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontWeight: '800', color: '#00bcd4', fontSize: '1.1rem' }}>+{log.mgAmount} mg</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No caffeine entries recorded today.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <Sparkles size={32} color="#00bcd4" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI Caffeine Log Parser</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Use the top <strong>+ AI Log</strong> button to dictate or type natural language intake!
          </p>
        </div>
      )}
    </div>
  );
}

