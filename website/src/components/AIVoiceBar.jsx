import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Sparkles, Mic, MicOff, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIVoiceBar({ placeholder = "Type or speak e.g. 'Slept 7.5 hours', 'Drank 2 cups of coffee'..." }) {
  const { addAILog } = useContext(AppContext);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = 'en-US';

        reco.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setText(transcript);
          setIsListening(false);
        };

        reco.onerror = (err) => {
          console.warn('Speech Recognition error:', err);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        setRecognition(reco);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please type your phrase.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsParsing(true);
    setFeedback(null);

    const res = await addAILog(text);
    setIsParsing(false);
    setFeedback(res);
    setText('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.3)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Sparkles size={18} color="#06b6d4" />
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>AI Voice & Natural Language Logger</span>
        {isListening && (
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', marginLeft: '0.5rem', animation: 'pulse 1s infinite' }}>
            🔴 Listening... Speak now
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button 
          type="button" 
          onClick={toggleListening}
          className="glass-card"
          style={{ 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            border: isListening ? '1px solid #ef4444' : '1px solid rgba(6, 182, 212, 0.4)', 
            backgroundColor: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.2)', 
            color: isListening ? '#ef4444' : '#06b6d4', 
            cursor: 'pointer',
            boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none',
            transition: 'all 0.2s'
          }}
          title={isListening ? 'Stop Listening' : 'Start Voice Input'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input 
          type="text" 
          placeholder={placeholder} 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="input-field"
          style={{ paddingLeft: '1rem', flex: 1 }}
        />

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isParsing}
          style={{ backgroundColor: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          <Send size={16} /> {isParsing ? 'Parsing...' : 'Parse & Log'}
        </button>
      </form>

      {feedback && (
        <div 
          className="glass-card" 
          style={{ 
            marginTop: '0.75rem', 
            padding: '0.75rem 1rem', 
            backgroundColor: feedback.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            borderColor: feedback.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)', 
            fontSize: '0.85rem', 
            color: feedback.success ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {feedback.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.summary}</span>
        </div>
      )}
    </div>
  );
}
