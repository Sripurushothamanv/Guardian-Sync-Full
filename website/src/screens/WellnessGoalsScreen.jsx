import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Flame, Plus, Moon, Coffee, Droplets, Award, Sprout } from 'lucide-react';

export default function WellnessGoalsScreen() {
  const { goals, addGoal, addLogToGoal } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('8');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title) return;
    addGoal(title, 'custom', target);
    setTitle('');
    setShowAddModal(false);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Goal Streak Card matching Page 19 */}
      <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'center' }}>
        <Flame size={32} color="#ff9f43" style={{ margin: '0 auto 0.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ff9f43', margin: '0 0 0.25rem 0' }}>
          Goal Streak: 0 Days
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          Log daily to maintain your adaptivity streaks.
        </span>
      </div>

      {/* Today Wellness Targets Section matching Page 19 */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Today Wellness Targets
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Target 1: Sleep Duration */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                <Moon size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>
                  Sleep Duration
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>≥ 8 hrs</span>
              </div>
            </div>
            <button className="btn-purple" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>
              + Add Log
            </button>
          </div>

          {/* Target 2: Caffeine Intake */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(0, 188, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00bcd4' }}>
                <Coffee size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>
                  Caffeine Intake
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>≤ 400 mg</span>
              </div>
            </div>
            <button className="btn-cyan" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>
              + Add Log
            </button>
          </div>

          {/* Target 3: Hydration Intake */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                <Droplets size={22} />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>
                  Hydration Intake
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>≥ 3000 ml</span>
              </div>
            </div>
            <button className="btn-purple" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>
              + Add Log
            </button>
          </div>

        </div>

        {/* Primary Cyan Button matching Page 19 */}
        <button 
          onClick={() => setShowAddModal(!showAddModal)}
          className="btn-cyan" 
          style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', borderRadius: '0.65rem', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add New Goal
        </button>

        {showAddModal && (
          <form onSubmit={handleAddGoal} className="glass-panel" style={{ padding: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Goal Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="input-field" 
              required 
            />
            <input 
              type="number" 
              placeholder="Target Value" 
              value={target} 
              onChange={e => setTarget(e.target.value)} 
              className="input-field" 
              required 
            />
            <button type="submit" className="btn-cyan">Save Goal</button>
          </form>
        )}
      </div>

      {/* Merit Badges & Awards Section matching Page 19 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Merit Badges & Awards
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Badge 1 */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(0, 184, 148, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b894' }}>
              <Sprout size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>First Step</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Unlocked</span>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <Moon size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>Sleep Champion</strong>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Unlocked</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

