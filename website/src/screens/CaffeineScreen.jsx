import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Coffee, Sparkles, Send, Info, Plus, Minus } from 'lucide-react';

export default function CaffeineScreen() {
  const { addLog, addAILog, logs, dashboardData } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('manual');
  const [beverage, setBeverage] = useState('Filter Coffee');
  const [mgPerCup, setMgPerCup] = useState(95);
  const [count, setCount] = useState(1);
  const [aiText, setAiText] = useState('');
  const [aiResult, setAiResult] = useState(null);
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

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    setLoading(true);
    const res = await addAILog(aiText);
    setLoading(false);
    setAiResult(res);
    setAiText('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Coffee size={28} color="#f59e0b" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Caffeine Tracker</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>5-Hour Half-Life Exponential Decay Tracking</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button 
            type="button" 
            onClick={() => setActiveTab('manual')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: 'none', backgroundColor: activeTab === 'manual' ? 'rgba(245, 158, 11, 0.25)' : 'transparent', color: activeTab === 'manual' ? '#f59e0b' : 'rgba(255,255,255,0.6)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ☕ Manual Preset Log
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('ai')}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: 'none', backgroundColor: activeTab === 'ai' ? 'rgba(6, 182, 212, 0.25)' : 'transparent', color: activeTab === 'ai' ? '#06b6d4' : 'rgba(255,255,255,0.6)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
          >
            <Sparkles size={16} /> AI Voice/Text
          </button>
        </div>

        {activeTab === 'manual' ? (
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
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{count} Cup(s)</span>
                <button type="button" onClick={() => setCount(count + 1)} className="glass-card" style={{ padding: '0.5rem 0.85rem', color: 'white', cursor: 'pointer' }}><Plus size={16} /></button>
                <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 'bold', fontSize: '1.1rem' }}>= {mgPerCup * count} mg</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging...' : 'Save Caffeine Entry'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAISubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Describe your intake in natural language:</label>
            <input 
              type="text" 
              placeholder="e.g. 'Drank 2 cups of filter coffee at 3pm'" 
              value={aiText} 
              onChange={e => setAiText(e.target.value)} 
              className="input-field" 
              style={{ paddingLeft: '1rem' }} 
              required 
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ backgroundColor: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={16} /> Parse with AI
            </button>

            {aiResult && (
              <div className="glass-card" style={{ padding: '0.85rem', backgroundColor: aiResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: aiResult.success ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                {aiResult.summary}
              </div>
            )}
          </form>
        )}
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
