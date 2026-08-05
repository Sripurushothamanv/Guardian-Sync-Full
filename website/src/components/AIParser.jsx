import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Mic, MicOff, Sparkles, CheckCircle } from 'lucide-react';

export default function AIParser({ type = 'shift', placeholder = 'e.g. Worked a 12 hour night shift yesterday with 45 minutes breaks.', buttonText = 'Parse Shift with AI', accentColor = '#ff9f43' }) {
  const { parseAILog, addLog } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      // Fallback if browser doesn't support Web Speech API
      if (!isListening) {
        setIsListening(true);
        const demoPhrase = type === 'shift' 
          ? 'Worked 12 hour night shift yesterday with 45 minutes rest' 
          : type === 'sleep'
          ? 'Slept for 7.5 hours last night with good quality sleep'
          : type === 'caffeine'
          ? 'Drank 2 cups of filter coffee'
          : 'Ate a bowl of oatmeal with 350 calories and drank 500ml water';
        
        setTimeout(() => {
          setInputText(demoPhrase);
          setIsListening(false);
        }, 1200);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setParsedResult(null);

    const res = parseAILog(inputText);

    if (type === 'shift' && res.shift) {
      await addLog('shift', res.shift);
      setParsedResult(`Logged Shift: ${res.shift.shiftType} Shift (${res.shift.duration} hrs)`);
    } else if (type === 'sleep' && res.sleep) {
      await addLog('sleep', {
        startTime: new Date(Date.now() - res.sleep.duration * 3600000).toISOString(),
        endTime: new Date().toISOString(),
        quality: res.sleep.quality,
        wakeUps: res.sleep.wakeUps
      });
      setParsedResult(`Logged Sleep: ${res.sleep.duration} hrs (${res.sleep.quality} quality)`);
    } else if (type === 'caffeine' && res.caffeine) {
      await addLog('caffeine', res.caffeine);
      setParsedResult(`Logged Caffeine: ${res.caffeine.beverage} (${res.caffeine.mgAmount} mg)`);
    } else if (type === 'nutrition') {
      await addLog('nutrition', {
        foodItem: inputText,
        mealCategory: 'Meal',
        calories: 350,
        volume: inputText.toLowerCase().includes('water') ? 500 : 0
      });
      setParsedResult(`Logged Entry: "${inputText}"`);
    } else {
      // General fallback log
      await addLog(type, { text: inputText, timestamp: new Date().toISOString() });
      setParsedResult(`Logged AI Entry: "${inputText}"`);
    }

    setInputText('');
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
        AI {type.charAt(0).toUpperCase() + type.slice(1)} Parser
      </h3>

      {/* Input container with microphone circle button matching image */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ 
          flex: 1, 
          backgroundColor: '#161C36', 
          borderRadius: '0.75rem', 
          border: `1px solid ${isListening ? accentColor : 'rgba(255, 255, 255, 0.1)'}`, 
          padding: '1rem',
          minHeight: '90px',
          boxShadow: isListening ? `0 0 15px ${accentColor}50` : 'none',
          transition: 'all 0.3s ease'
        }}>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Circular Microphone Button matching screenshot */}
        <button
          type="button"
          onClick={toggleListening}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(22, 28, 54, 0.9)',
            border: `2px solid ${accentColor}`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: `0 0 15px ${accentColor}40`,
            transition: 'transform 0.2s ease, background-color 0.2s ease'
          }}
          title={isListening ? "Listening... Click to stop" : "Click to speak voice input"}
        >
          {isListening ? (
            <MicOff size={24} color="#ef4444" className="animate-pulse" />
          ) : (
            <Mic size={24} color={accentColor} />
          )}
        </button>
      </div>

      {isListening && (
        <span style={{ fontSize: '0.8rem', color: accentColor, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor, display: 'inline-block' }} />
          Listening to your voice... Speak clearly.
        </span>
      )}

      {/* Parse Button matching screenshot */}
      <button
        type="button"
        onClick={handleParse}
        disabled={loading || !inputText.trim()}
        className="btn-orange"
        style={{
          width: '100%',
          padding: '0.95rem',
          fontSize: '1rem',
          borderRadius: '0.65rem',
          backgroundColor: accentColor,
          borderColor: accentColor,
          opacity: (!inputText.trim() && !loading) ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <Sparkles size={18} />
        {loading ? 'Parsing with AI...' : buttonText}
      </button>

      {/* Confirmation Box */}
      {parsedResult && (
        <div className="glass-card" style={{ padding: '1rem', borderColor: accentColor, backgroundColor: `${accentColor}15`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={20} color={accentColor} />
          <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>{parsedResult}</span>
        </div>
      )}
    </div>
  );
}
