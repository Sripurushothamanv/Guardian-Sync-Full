import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { Send, Sparkles, Loader2, Bot, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIChatScreen() {
  const { addAILog, confirmAILog } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      id: 'm_welcome',
      sender: 'bot',
      text: "Hello! I am your Guardian-Sync AI assistant. You can log your entire day in a single sentence. Try dictating or typing something like:\n\n*\"I finished a 12-hour night shift, drank 3 cups of coffee, and slept 5 hours last night.\"*",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    setInputText('');
    
    // Add user message to log
    const userMsg = {
      id: 'm_' + Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Call parser
    const parsedData = await addAILog(userMsgText);
    setLoading(false);

    // Check if anything was extracted
    const hasExtraction = parsedData && (parsedData.sleep || parsedData.caffeine || parsedData.shift || (parsedData.nutrition && parsedData.nutrition.length > 0));

    if (hasExtraction) {
      const botMsg = {
        id: 'm_' + Date.now() + '_bot',
        sender: 'bot',
        text: 'I detected wellness activities in your message. Please confirm these extractions:',
        parsedPayload: parsedData, // attaching parsed payload for interactive confirmation
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } else {
      const botMsg = {
        id: 'm_' + Date.now() + '_bot',
        sender: 'bot',
        text: 'I could not extract any sleep, caffeine, shifts, or food logs. Try mentioning quantities, e.g. "I slept 6 hours, drank 2 coffees, and ate biryani for lunch."',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const handleConfirmExtraction = async (payload, msgId) => {
    setLoading(true);
    await confirmAILog(payload);
    setLoading(false);

    // Remove the confirmation panel from the message and add a success message
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          text: 'Extraction confirmed and successfully logged to your dashboard! 🚀 Fatigue calculations updated.',
          parsedPayload: null,
          isLogged: true
        };
      }
      return m;
    }));
  };

  const handleRejectExtraction = (msgId) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          text: 'Extraction cancelled.',
          parsedPayload: null
        };
      }
      return m;
    }));
  };

  return (
    <div className="ai-chat-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))', color: 'white' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2>Guardian AI Assistant</h2>
            <p>Enter natural sentences to quickly log health logs in under 5 seconds.</p>
          </div>
        </div>
      </header>

      <div className="chat-container glass-panel">
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-bubble glass-card">
                <p className="message-text">{msg.text}</p>

                {/* Render interactive confirmation panel if attached */}
                {msg.parsedPayload && (
                  <div className="chat-confirm-panel glass-card">
                    <h5>🔍 Extracted Logs</h5>
                    <div className="confirm-list">
                      {msg.parsedPayload.sleep && (
                        <div className="confirm-row">
                          <span>🛌 Sleep</span>
                          <strong>{msg.parsedPayload.sleep.duration}h ({msg.parsedPayload.sleep.quality})</strong>
                        </div>
                      )}
                      {msg.parsedPayload.caffeine && (
                        <div className="confirm-row">
                          <span>☕ Caffeine</span>
                          <strong>{msg.parsedPayload.caffeine.beverage} x {msg.parsedPayload.caffeine.count} ({msg.parsedPayload.caffeine.mgAmount}mg)</strong>
                        </div>
                      )}
                      {msg.parsedPayload.shift && (
                        <div className="confirm-row">
                          <span>⏱️ Shift</span>
                          <strong>{msg.parsedPayload.shift.duration}h {msg.parsedPayload.shift.shiftType} Shift</strong>
                        </div>
                      )}
                      {msg.parsedPayload.nutrition && msg.parsedPayload.nutrition.length > 0 && (
                        <div className="confirm-row select-all">
                          <span>🍛 Meals ({msg.parsedPayload.nutrition.length})</span>
                          <strong>
                            {msg.parsedPayload.nutrition.map(n => n.foodItem).join(', ')}
                          </strong>
                        </div>
                      )}
                    </div>
                    <div className="chat-confirm-actions">
                      <button className="btn-secondary btn-small" onClick={() => handleRejectExtraction(msg.id)}>Discard</button>
                      <button className="btn-primary btn-small" onClick={() => handleConfirmExtraction(msg.parsedPayload, msg.id)}>Log All</button>
                    </div>
                  </div>
                )}
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-row bot loading-indicator">
              <div className="message-avatar"><Bot size={16} /></div>
              <div className="message-bubble glass-card">
                <Loader2 size={16} className="spin-slow" />
                <span>AI is extracting data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            placeholder="e.g. Slept 6h, had 2 coffees at noon, worked night shift..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="input-field chat-input-field"
            disabled={loading}
          />
          <button type="submit" className="btn-primary chat-send-btn" disabled={loading || !inputText.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>

      <style>{`
        .ai-chat-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 900px;
          height: calc(100vh - 80px);
          margin: 0 auto;
        }
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(12, 17, 34, 0.5);
          border-radius: var(--border-radius-lg);
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .message-row {
          display: flex;
          gap: 1rem;
          max-width: 80%;
        }
        .message-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .message-row.bot {
          align-self: flex-start;
        }
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .message-row.user .message-avatar {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);
          color: var(--color-primary);
        }
        .message-row.bot .message-avatar {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.3);
          color: var(--color-secondary);
        }
        .message-bubble {
          padding: 1rem !important;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          position: relative;
        }
        .message-row.user .message-bubble {
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.1);
        }
        .message-text {
          font-size: 0.88rem;
          color: white;
          line-height: 1.45;
          white-space: pre-wrap;
        }
        .message-time {
          font-size: 0.65rem;
          color: var(--text-muted);
          align-self: flex-end;
        }
        
        .chat-confirm-panel {
          border: 1px dashed rgba(6, 182, 212, 0.4);
          background: rgba(6, 182, 212, 0.03);
          padding: 0.75rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .chat-confirm-panel h5 {
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
        }
        .confirm-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .confirm-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          padding-bottom: 0.2rem;
        }
        .confirm-row.select-all {
          flex-direction: column;
          gap: 0.1rem;
          border: none;
        }
        .confirm-row span {
          color: var(--text-secondary);
        }
        .confirm-row strong {
          color: white;
        }
        .chat-confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .chat-input-bar {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(10, 14, 30, 0.4);
        }
        .chat-input-field {
          flex: 1;
        }
        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .loading-indicator .message-bubble {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
