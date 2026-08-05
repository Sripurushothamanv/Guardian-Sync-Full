import React from 'react';
import { FileText, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function WeeklyReportScreen() {
  const trendData = [
    { day: 'Mon', score: 0 },
    { day: 'Tue', score: 2 },
    { day: 'Wed', score: 7 },
    { day: 'Thu', score: 12 },
    { day: 'Fri', score: 17 },
    { day: 'Sat', score: 22 },
    { day: 'Sun', score: 27 }
  ];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header with Title & Top-Right PDF Button matching Page 18 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
          Weekly Analysis
        </h1>
        <button 
          onClick={handleExportPDF} 
          style={{
            backgroundColor: 'rgba(0, 188, 212, 0.2)',
            border: '1px solid #00bcd4',
            color: '#00bcd4',
            padding: '0.4rem 0.85rem',
            borderRadius: '0.4rem',
            fontWeight: '800',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <FileText size={16} /> PDF
        </button>
      </div>

      {/* Wellness Metrics Comparison Section matching Page 18 */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Wellness Metrics Comparison
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Average Sleep Session */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                Average Sleep Session
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Prior week: 6.5 hrs</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>7.0 hrs</strong>
              <TrendingUp size={16} color="#00b894" />
            </div>
          </div>

          {/* Logged Work Shifts */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                Logged Work Shifts
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Prior week: 6 duties</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>5 duties</strong>
              <TrendingUp size={16} color="#00b894" />
            </div>
          </div>

          {/* Caffeine Intake */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                Caffeine Intake
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Prior week: 450mg</span>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>380mg</strong>
              <TrendingUp size={16} color="#00b894" />
            </div>
          </div>

        </div>
      </div>

      {/* Fatigue Trends vs Prior Week Bar Chart matching Page 18 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.5rem' }}>
          Fatigue Trends vs Prior Week
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

      {/* Weekly Nutrition Averages matching Page 18 */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Weekly Nutrition Averages
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Daily Calories Average:</span>
            <strong style={{ color: '#ffffff' }}>0 kcal</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Daily Protein Average:</span>
            <strong style={{ color: '#ffffff' }}>0 g</strong>
          </div>
        </div>
      </div>

    </div>
  );
}

