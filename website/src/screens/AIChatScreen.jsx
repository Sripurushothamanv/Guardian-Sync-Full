import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Bot, Send, User, Sparkles } from 'lucide-react';

export default function AIChatScreen() {
  const { getAIChatResponse, dashboardData } = useContext(AppContext);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hello! I am your Guardian-Sync AI Assistant. Your current fatigue index is ${dashboardData?.fatigueScore || 28}/100. How can I help you with your readiness or shift recovery today?` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    const replyText = getAIChatResponse(input);
    const aiMsg = { sender: 'ai', text: replyText };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 7rem)', display: 'flex', flexDirection: 'column' }} className="glass-panel">
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bot size={28} color="#06b6d4" />
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Guardian AI Voice & Context Advisor</h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Real-time shift fatigue & drive safety intelligence</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem' }}>
            {m.sender === 'ai' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#06b6d4" />
              </div>
            )}

            <div className="glass-card" style={{ padding: '0.85rem 1.1rem', maxWidth: '75%', borderRadius: '1rem', backgroundColor: m.sender === 'user' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(22, 28, 54, 0.7)', borderColor: m.sender === 'user' ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-glass)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="#8b5cf6" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '0.75rem' }}>
        <input 
          type="text" 
          placeholder="Ask AI: Am I safe to drive? / How is my caffeine level?" 
          value={input}
          onChange={e => setInput(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '1rem' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
