import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { Screen } from '../types';
import { generateBuildIdeas } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface IdeasChatScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

export const IdeasChatScreen: React.FC<IdeasChatScreenProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Building Assistant. I can help you find build ideas based on your collection or answer questions about specific bricks. What would you like to build today?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Real AI response
    try {
      const stored = localStorage.getItem('hellobrick_collection');
      const bricks = stored ? JSON.parse(stored).bricks || [] : [];
      const content = await generateBuildIdeas(input, bricks);
      
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: content,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat failed:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (confirm('Clear entire conversation?')) {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: "Conversation cleared. How can I help you now?",
        timestamp: Date.now(),
      }]);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050A18] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-[max(env(safe-area-inset-top),24px)] pb-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight">Brick Butler</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center active:scale-90 transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar"
      >
        <div className="flex justify-center mb-8">
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-[11px] font-black text-amber-500 uppercase tracking-wider text-center">
              Personalized Building Insights
            </p>
          </div>
        </div>

        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                m.role === 'user' ? 'bg-orange-500' : 'bg-slate-800 border border-white/10'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-orange-400" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-orange-500 text-white rounded-tr-none shadow-lg' 
                  : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-800 border border-white/10">
                <Bot className="w-4 h-4 text-orange-400" />
              </div>
              <div className="bg-slate-800/40 px-4 py-3 rounded-2xl flex gap-1 items-center rounded-tl-none">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your bricks..."
            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-700 transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-center mt-3 text-slate-600 font-bold uppercase tracking-widest">
           Experimental • Avoid sharing personal info
        </p>
      </div>
    </div>
  );
};
