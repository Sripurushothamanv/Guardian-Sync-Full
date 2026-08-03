import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Target, Plus, CheckCircle, Trash2, Award, Edit2, Flame, Sparkles, X } from 'lucide-react';

export default function WellnessGoalsScreen() {
  const { goals, addGoal, editGoal, deleteGoal, addLogToGoal, streakInfo } = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('sleep');
  const [target, setTarget] = useState('8');
  
  // Edit Modal State
  const [editingGoal, setEditingGoal] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title) return;
    addGoal(title, type, target);
    setTitle('');
  };

  const handleOpenEdit = (g) => {
    setEditingGoal(g);
    setEditTitle(g.title);
    setEditTarget(String(g.targetValue));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingGoal || !editTitle) return;
    editGoal(editingGoal._id, editTitle, editTarget);
    setEditingGoal(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
      {/* Left Column: Goal CRUD & List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Target size={28} color="#14b8a6" className="neon-glow-emerald" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Wellness Goals</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Custom targets, progress rings & streak tracking</p>
          </div>
        </div>

        {/* Add Goal Form */}
        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Goal Title</label>
            <input type="text" placeholder="e.g. Daily Water Target 3000ml" value={title} onChange={e => setTitle(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Category</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(12, 15, 32, 0.9)' }}>
                <option value="sleep">Sleep Target</option>
                <option value="caffeine">Caffeine Limit</option>
                <option value="water">Hydration Target</option>
                <option value="nutrition">Nutrition Target</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Target Value</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#14b8a6' }}>
            <Plus size={16} /> Create Goal Target
          </button>
        </form>

        {/* Edit Modal / Inline Form */}
        {editingGoal && (
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: '#14b8a6', backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#14b8a6' }}>Edit Goal Target</strong>
              <button type="button" onClick={() => setEditingGoal(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }} required />
              <input type="number" value={editTarget} onChange={e => setEditTarget(e.target.value)} className="input-field" style={{ paddingLeft: '0.75rem' }} required />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.85rem', backgroundColor: '#14b8a6' }}>
                Save Changes
              </button>
            </form>
          </div>
        )}

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active Goals & Circular Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto' }}>
          {goals && goals.length > 0 ? (
            goals.map((g, i) => {
              const current = g.currentValue || 0;
              const targetVal = g.targetValue || 1;
              const pct = Math.min(100, Math.round((current / targetVal) * 100));
              const isDone = current >= targetVal;

              return (
                <div key={g._id || i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Progress Ring SVG */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="transparent" />
                        <circle 
                          cx="24" 
                          cy="24" 
                          r="20" 
                          stroke={isDone ? '#10b981' : '#14b8a6'} 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={125}
                          strokeDashoffset={125 - (125 * (pct / 100))} 
                          strokeLinecap="round"
                          transform="rotate(-90 24 24)"
                          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                        />
                      </svg>
                      <span style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: 'bold' }}>{pct}%</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{g.title}</span>
                        <span className={`badge-status ${isDone ? 'badge-completed' : 'badge-active'}`}>
                          {isDone ? 'COMPLETED' : 'ACTIVE'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '0.2rem' }}>
                        Progress: {current} / {targetVal}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button type="button" onClick={() => addLogToGoal(g._id, 1)} style={{ padding: '0.35rem 0.65rem', backgroundColor: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.4)', borderRadius: '0.35rem', color: '#14b8a6', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      + Progress
                    </button>
                    <button type="button" onClick={() => handleOpenEdit(g)} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer' }}>
                      <Edit2 size={16} />
                    </button>
                    {g.isCustom && (
                      <button type="button" onClick={() => deleteGoal(g._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No wellness goals created yet.</p>
          )}
        </div>
      </div>

      {/* Right Column: Streaks & Badges */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Streak Counter Card */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <Flame size={36} color="#f59e0b" className="neon-glow-amber" style={{ margin: '0 auto 0.35rem' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1px' }}>WELLNESS HABIT STREAK</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#f59e0b', margin: '0.25rem 0' }}>🔥 5 Day Streak</h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Logged sleep, caffeine & hydration consistently!</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Award size={24} color="#f59e0b" />
          <h3 style={{ fontSize: '1.1rem' }}>Unlocked Achievements</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(streakInfo?.badges || [
            { title: 'First Step', description: 'Joined Guardian-Sync and started tracking wellness.', icon: '🌱', unlocked: true },
            { title: 'Sleep Champion', description: 'Logged sleep 3+ times to manage sleep debt.', icon: '😴', unlocked: true },
            { title: 'Night Shift Survivor', description: 'Completed 3+ overnight shifts.', icon: '🦇', unlocked: true },
            { title: 'Caffeine Commander', description: 'Logged caffeine intake 5+ times.', icon: '☕', unlocked: true }
          ]).map((b, i) => (
            <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: b.unlocked ? 1 : 0.4 }}>
              <span style={{ fontSize: '2rem' }}>{b.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{b.title}</strong>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{b.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
