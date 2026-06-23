import React, { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import { Send, BrainCircuit, Sparkles, User, Bot } from 'lucide-react';

const AIAssistant = ({ tasks, habits }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hey! I am your productivity coach. Ready to beat those deadlines? Ask me anything!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED').length;
  const activeHabits = habits.length;

  const handleSendMessage = async (e, customText = '') => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build context
    const taskContext = tasks
      .filter(t => t.status !== 'COMPLETED')
      .map(t => `${t.title} (due ${t.deadline})`)
      .join(', ');
    const habitContext = habits
      .map(h => `${h.name} (streak: ${h.currentStreak}d)`)
      .join(', ');
    const contextStr = `Current Date/Time: ${new Date().toLocaleString()}. Pending Tasks: [${taskContext}]. Habits: [${habitContext}].`;

    try {
      const result = await aiService.chat(textToSend, contextStr);
      const botMsg = { sender: 'bot', text: result.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I hit a snag connecting to Gemini. Try again!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chips = [
    'How do I stay focused?',
    'Prioritize my day',
    'Unstick my coding habit'
  ];

  return (
    <div className="glass-panel rounded-xl flex flex-col h-[400px]">
      
      {/* Header Context Indicator */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-indigo-400 animate-pulse" size={18} />
          <span className="font-bold text-sm text-slate-200">AI Coach Cockpit</span>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
          Context Loaded ({activeTasks} Tasks, {activeHabits} Habits)
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`p-1.5 rounded-lg shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-indigo-400 border border-slate-700/50'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div className={`p-3 rounded-xl max-w-[80%] text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg shrink-0 bg-slate-800 text-indigo-400 border border-slate-700/50">
              <Bot size={14} />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs rounded-tl-none flex items-center gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce [animation-delay:0.2s]">●</span>
              <span className="animate-bounce [animation-delay:0.4s]">●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(null, chip)}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-full transition-colors font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/40 rounded-b-xl flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI productivity coach..."
          className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shrink-0 disabled:opacity-50 active:scale-[0.98]"
        >
          <Send size={14} />
        </button>
      </form>

    </div>
  );
};

export default AIAssistant;
