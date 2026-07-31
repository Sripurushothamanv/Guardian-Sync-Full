import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Target, Plus, CheckCircle, Trash2, Award } from 'lucide-react';

export default function WellnessGoalsScreen() {
  const { goals, addGoal, deleteGoal, addLogToGoal, streakInfo } = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('sleep');
  const [target, setTarget] = useState('8');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title) return;
    addGoal(title, type, target);
    setTitle('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Target size={28} color="#14b8a6" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Wellness Goals</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Custom targets & habit streak tracking</p>
          </div>
        </div>

        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Goal Title</label>
            <input type="text" placeholder="e.g. Daily Water Target 3000ml" value={title} onChange={e => setTitle(e.target.value)} className="input-field" style={{ paddingLeft: '1rem' }} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'rgba(255,255,255,0.7)' }}>Category</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input-field" style={{ paddingLeft: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
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

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Create Goal Target
          </button>
        </form>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active Goals</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
          {goals && goals.length > 0 ? (
            goals.map((g, i) => (
              <div key={g._id || i} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'block' }}>{g.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Current: {g.currentValue || 0} / {g.targetValue}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" onClick={() => addLogToGoal(g._id, 1)} style={{ padding: '0.35rem 0.65rem', backgroundColor: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.4)', borderRadius: '0.35rem', color: '#14b8a6', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    + Progress
                  </button>
                  {g.isCustom && (
                    <button type="button" onClick={() => deleteGoal(g._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>No wellness goals created yet.</p>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Award size={28} color="#f59e0b" />
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Badges & Streaks</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Streak Count: {streakInfo?.streakCount || 3} Days 🔥</p>
          </div>
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
