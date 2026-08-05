import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { Clock, Droplets, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function BurnoutScreen() {
  const { dashboardData } = useContext(AppContext);

  const trendData = [
    { day: 'Mon', score: 0 },
    { day: 'Tue', score: 2 },
    { day: 'Wed', score: 9 },
    { day: 'Thu', score: 16 },
    { day: 'Fri', score: 23 },
    { day: 'Sat', score: 30 },
    { day: 'Sun', score: 37 }
  ];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Hero Card matching Page 15 */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
          Weekly Fatigue Average
        </span>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: '#8b5cf6', margin: '0.25rem 0 0.5rem 0', lineHeight: 1 }}>
          17%
        </h1>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
          High Risk threshold: 70%
        </span>
      </div>

      {/* 7-Day Cumulative Burnout Trend Bar Chart matching Page 15 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.5rem' }}>
          7-Day Cumulative Burnout Trend
        </h3>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" tickLine={false} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.6)" tickLine={false} />
              <Bar dataKey="score" fill="#00b894" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#00b894', fontSize: 12, fontWeight: 'bold' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Burnout Preventative Protocols matching Page 15 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Burnout Preventative Protocols
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(0, 184, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b894' }}>
              <Clock size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
                Circadian Adaptation Gap
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                Observe at least 11 hours of resting separation between shifts.
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(0, 184, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b894' }}>
              <Droplets size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
                Hydration Saturation
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                Drink 500ml of mineralized water for every cup of coffee logged.
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '0.65rem', backgroundColor: 'rgba(0, 184, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b894' }}>
              <Calendar size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
                Roster caps
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                Limit schedule rosters to maximum 3 consecutive night-shift duties.
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

