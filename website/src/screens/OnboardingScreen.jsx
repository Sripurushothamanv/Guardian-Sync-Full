import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Coffee, ShieldCheck, ChevronRight } from 'lucide-react';

export default function OnboardingScreen() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      icon: <Brain size={48} color="#8b5cf6" />,
      tag: 'BIOMEDICAL AI',
      title: 'Heuristic Fatigue Predictor',
      description: 'Our proprietary algorithm factors in sleep debt, hours awake, coffee decays, and shift parameters to predict your fatigue index in real-time.'
    },
    {
      icon: <Coffee size={48} color="#f59e0b" />,
      tag: 'EXPONENTIAL DECAY',
      title: 'Active Caffeine Tracking',
      description: 'Track coffee, tea, and energy drink consumption with a 5-hour half-life exponential decay model to optimize alertness during long shifts.'
    },
    {
      icon: <ShieldCheck size={48} color="#10b981" />,
      tag: 'AUTOMATED SAFETY',
      title: 'Safe to Drive Assessor',
      description: 'Real-time safety checks evaluate whether you are safe to drive home after heavy overnight hospital shifts.'
    }
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#8b5cf6', letterSpacing: '1px' }}>GUARDIANSYNC</span>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}>Skip</button>
        </div>

        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          {slides[slide].icon}
        </div>

        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#06b6d4', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>
          {slides[slide].tag}
        </span>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{slides[slide].title}</h2>

        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', minHeight: '80px' }}>
          {slides[slide].description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {slides.map((_, i) => (
              <div key={i} style={{ width: i === slide ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === slide ? '#8b5cf6' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
            ))}
          </div>

          <button onClick={handleNext} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}>
            {slide === slides.length - 1 ? 'Get Started' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
