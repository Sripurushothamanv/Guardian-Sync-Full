import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Car, ChevronRight, Activity } from 'lucide-react';

export default function OnboardingScreen() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Heuristic Fatigue Predictor',
      description: 'Our proprietary algorithm factors in sleep debt, hours awake, coffee decays, and shift parameters to predict your fatigue index in real-time.',
      icon: Brain,
      color: '#8b5cf6',
      badge: 'BIOMEDICAL AI'
    },
    {
      title: 'Dual NLP Logging Modes',
      description: 'Too tired to type after a 12-hour duty? Type or dictate one sentence: "Slept 4 hours, 2 coffees, worked night shift". The AI extracts and saves everything.',
      icon: Sparkles,
      color: '#06b6d4',
      badge: 'ZERO FRICTION'
    },
    {
      title: 'Safe-To-Drive Check',
      description: 'Receive color-coded safety indices (Safe, Caution, Unsafe) with advice and run quick cognitive reaction response tests before starting your vehicle.',
      icon: Car,
      color: '#10b981',
      badge: 'LIFE-SAVING WARNINGS'
    }
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      navigate('/register');
    }
  };

  const handleSkip = () => {
    navigate('/register');
  };

  const CurrentIcon = slides[slide].icon;

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-card glass-panel">
        <div className="onboarding-header">
          <div className="brand-logo">
            <Activity size={18} color="#8b5cf6" />
            <span>GUARDIAN<strong>SYNC</strong></span>
          </div>
          <button className="skip-btn" onClick={handleSkip}>Skip</button>
        </div>

        <div className="onboarding-body">
          <div 
            className="icon-sphere" 
            style={{ 
              backgroundColor: `${slides[slide].color}15`, 
              borderColor: `${slides[slide].color}30`,
              boxShadow: `0 0 30px ${slides[slide].color}15`
            }}
          >
            <CurrentIcon size={48} color={slides[slide].color} className="bounce-on-mount" />
          </div>
          
          <span className="onboard-badge" style={{ color: slides[slide].color, background: `${slides[slide].color}12` }}>
            {slides[slide].badge}
          </span>

          <h2>{slides[slide].title}</h2>
          <p>{slides[slide].description}</p>
        </div>

        <div className="onboarding-footer">
          <div className="indicator-row">
            {slides.map((_, idx) => (
              <span 
                key={idx} 
                className={`indicator-dot ${idx === slide ? 'active' : ''}`}
                style={{ backgroundColor: idx === slide ? slides[slide].color : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>

          <button 
            onClick={handleNext} 
            className="btn-primary onboard-next-btn"
            style={{ background: `linear-gradient(135deg, ${slides[slide].color}, #4f46e5)` }}
          >
            {slide === slides.length - 1 ? 'Start Logging' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        .onboarding-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1.5rem;
          width: 100%;
        }
        .onboarding-card {
          width: 100%;
          max-width: 440px;
          min-height: 520px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: var(--border-radius-lg);
          position: relative;
          overflow: hidden;
        }
        .onboarding-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: white;
        }
        .brand-logo strong {
          color: var(--color-primary);
        }
        .skip-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-main);
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .skip-btn:hover {
          color: white;
        }
        .onboarding-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin: 2.5rem 0;
          gap: 1rem;
        }
        .icon-sphere {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .onboard-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .onboarding-body h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: white;
          margin-top: 0.25rem;
        }
        .onboarding-body p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .onboarding-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .indicator-row {
          display: flex;
          gap: 0.5rem;
        }
        .indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transition: var(--transition-smooth);
        }
        .indicator-dot.active {
          width: 16px;
          border-radius: 10px;
        }
        .onboard-next-btn {
          box-shadow: none !important;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .bounce-on-mount {
          animation: bounce 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
