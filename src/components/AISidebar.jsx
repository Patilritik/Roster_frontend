import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader } from 'lucide-react';
import axios from 'axios';

export default function AISidebar({ month, onRosterUpdate }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your **Roster AI Assistant**. 🗓️\n\nYou can ask me to manage leaves, week-offs, shifts, and duty adjustments in **Hinglish** or **English**. For example:\n\n* *'Rahul ko 10 se 14 Aug tak chutti de do'*\n* *'Aditi ko 15 August ko evening shift me laga do'*\n* *'Sneha ko 20 Aug ka week off de do'*\n* *'Rahul ko 22 Aug ko working kar do'*\n\nI will apply the instruction and instantly regenerate the roster for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userMessage }
    ]);

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: userMessage,
        month: month
      });

      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: response.data.message }
        ]);
        // Trigger roster refresh on parent component
        onRosterUpdate();
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: `⚠️ ${response.data.error || 'Parsing failed.'}` }
        ]);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Could not connect to AI services. Please ensure backend is running.';
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: `❌ **Error:** ${errMsg}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Convert markdown-like syntax to bold/italic HTML safely
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="ai-sidebar">
      <div className="ai-sidebar-header">
        <div className="ai-avatar">
          <Bot />
        </div>
        <div>
          <h2>Roster AI Copilot</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Powered by NLP Scheduler</p>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            {formatText(msg.text)}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>AI is scheduling leave and updating roster...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-area">
        <form onSubmit={handleSend} className="ai-chat-form">
          <input
            type="text"
            className="ai-chat-input"
            placeholder="Ask for leave, week-off, shift or duty change..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="ai-chat-send" disabled={loading || !input.trim()}>
            <Send />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
