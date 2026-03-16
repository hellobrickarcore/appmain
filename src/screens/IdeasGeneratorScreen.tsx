import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Sparkles, Image as ImageIcon, Loader2, User, Bot } from 'lucide-react';
import { Screen, Brick } from '../types';
import { generateBuildIdeas } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface IdeasGeneratorScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  initialBrick?: Brick;
  allBricks?: Brick[];
}

export const IdeasGeneratorScreen: React.FC<IdeasGeneratorScreenProps> = ({ onNavigate, initialBrick, allBricks }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialBrick 
        ? `Hi! I see you have a **${initialBrick.name}** in ${initialBrick.color}. What would you like to build with it today? I can suggest some creative ideas!` 
        : allBricks && allBricks.length > 0
        ? `Hi! I see you have **${allBricks.length} unique parts** in your vault. I can help you build something amazing with your collection! What are you in the mood for? (e.g. "A spaceship", "Something tiny")`
        : "Hi! I'm your Building Assistant. Tell me what bricks you have, or just ask for an idea, and I'll help you build something amazing!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const contextBricks = initialBrick ? [initialBrick] : (allBricks || []);
      const response = await generateBuildIdeas(input, contextBricks);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to get ideas:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble thinking of ideas right now. Please try again later!"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050A18] text-white font-sans">
      {/* Header */}
      <div className="bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/10 p-6 pt-[max(env(safe-area-inset-top),1.5rem)] flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate(Screen.COLLECTION)}
            className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Idea Generator</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 text-orange-500">
          <Sparkles className="w-5 h-5 shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 border-blue-400/30' 
                : 'bg-[#1E293B] border-white/10'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-orange-500" />}
            </div>
            
            <div className={`max-w-[75%] space-y-2`}>
              <div className={`p-4 rounded-[24px] shadow-xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-[#1E293B] text-slate-100 rounded-tl-none border border-white/5'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              {msg.image && (
                <div className="rounded-[24px] overflow-hidden border border-white/10 shadow-2xl">
                  <img src={msg.image} alt="Generated idea" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#1E293B] border border-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-orange-500" />
            </div>
            <div className="bg-[#1E293B] border border-white/5 p-4 rounded-[24px] rounded-tl-none shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] bg-gradient-to-t from-[#050A18] via-[#050A18] to-transparent">
        <div className="bg-[#1E293B] rounded-[32px] p-2 flex items-center border border-white/10 shadow-2xl focus-within:border-orange-500/50 transition-all">
          <button className="p-3 text-slate-500 hover:text-white transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for build ideas..."
            className="flex-1 bg-transparent border-none outline-none text-white px-3 font-bold text-sm placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isTyping 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 active:scale-90' 
                : 'bg-white/5 text-slate-700'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
