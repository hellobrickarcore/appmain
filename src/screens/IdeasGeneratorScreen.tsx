import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Sparkles, User, Bot, Camera, Box, Puzzle } from 'lucide-react';
import { Screen, Brick, BuildIdea, GPTBuilderResponse } from '../types';
import { getConversationalIdeas } from '../services/geminiService';
import { generateIdeaImage } from '../services/geminiImageService';
import { buildIdeaImagePrompt } from '../features/ideas/buildIdeasPrompt';
import { normalizeVault } from '../lib/brick/normalizeVault';

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ideas?: BuildIdea[];
  error?: boolean;
}

interface IdeasGeneratorScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  initialBrick?: Brick;
  allBricks?: Brick[];
}

export const IdeasGeneratorScreen: React.FC<IdeasGeneratorScreenProps> = ({ onNavigate, allBricks: allBricksProp }) => {
  const [allBricks, setAllBricks] = useState<Brick[]>(allBricksProp || []);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(['What can I build?', 'Random ideas']);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootstrapped = useRef(false);
  const requestInProgress = useRef(false);

  // 1. Initial Data Loading
  useEffect(() => {
    let bricks = allBricksProp || [];
    if (bricks.length === 0) {
      const stored = localStorage.getItem('hellobrick_collection');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          bricks = parsed.bricks || [];
        } catch (e) {
          console.warn('[IdeasGenerator] Failed to load collection:', e);
        }
      }
    }
    setAllBricks(bricks);
    console.log('[IdeasGenerator] vault loaded:', bricks.length);
  }, [allBricksProp]);

  // 2. Initial Greeting / Bootstrap (Run Once)
  useEffect(() => {
    if (bootstrapped.current || allBricks.length === 0) return;
    bootstrapped.current = true;
    
    // Auto-create initial assistant message instead of calling API immediately
    // to give user a clean landing.
    const introMsg: UIMessage = {
      id: 'intro',
      role: 'assistant',
      content: "You've got enough pieces for a few small builds! Want my best option or something unexpected?"
    };
    setMessages([introMsg]);
  }, [allBricks]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (overrideMessage?: string) => {
    const textToSend = overrideMessage || input;
    if (!textToSend.trim() || isTyping || requestInProgress.current) return;

    // Lock Request
    requestInProgress.current = true;
    const userMsg: UIMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Memory: filter only successful messages
      const history = messages
        .filter(m => !m.error)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));
      
      const response: GPTBuilderResponse = await getConversationalIdeas(textToSend, allBricks, history);
      
      // Part 16 Hard Fix: Chat First, Cards After, Parallel Generation (Max 2)
      const vaultSummary = normalizeVault(allBricks);
      const assistantMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.assistantMessage,
        ideas: response.topIdeas?.map(idea => {
           // We assign a prompt specifically for the image service here if needed,
           // or use the one provided by LLM. The user wants US to build the prompt
           // using the vault grounding if possible.
           return {
             ...idea,
             imagePrompt: buildIdeaImagePrompt(idea, vaultSummary),
             imageLoading: true
           };
        })
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      
      // background parallel generation for max 2 ideas
      if (assistantMsg.ideas && assistantMsg.ideas.length > 0) {
        const generationPool = assistantMsg.ideas.slice(0, 2);
        
        generationPool.forEach(async (idea) => {
          const idx = assistantMsg.ideas!.findIndex(i => i.ideaName === idea.ideaName);
          if (idx === -1) return;

          const attemptGeneration = async (isRetry = false) => {
            try {
               const vaultTotal = vaultSummary.totalBricks;
               const estUse = idea.estimatedBrickUse || 0;
               const maxBricks = Math.max(3, Math.min(20, Math.round(vaultTotal * 0.6)));

               // LOGGING GROUNDING DATA
               console.log(`[IdeasGenerator] IMAGE_GROUNDING ${isRetry ? '(RETRY)' : ''} {
                 ideaName: "${idea.ideaName}",
                 vaultTotal: ${vaultTotal},
                 maxBricksAllowed: ${maxBricks},
                 estimatedBrickUse: ${estUse},
                 imagePrompt: "${idea.imagePrompt}"
               }`);

               // VALIDATION LAYER
               if (estUse > vaultTotal && vaultTotal > 0) {
                  console.warn(`[ImageGenerator] BLOCKER: ${idea.ideaName} uses too many bricks (${estUse} > ${vaultTotal})`);
                  setMessages(current => current.map(m => {
                    if (m.id === assistantMsg.id && m.ideas) {
                      const updatedIdeas = [...m.ideas];
                      updatedIdeas[idx] = { ...updatedIdeas[idx], imageLoading: false };
                      return { ...m, ideas: updatedIdeas };
                    }
                    return m;
                  }));
                  return;
               }

               let finalPrompt = idea.imagePrompt;
               if (isRetry) {
                 finalPrompt = `IMPORTANT: show ONLY a brick-built construction made from standard rectangular LEGO bricks with visible studs. Do not show symbols, graphics, scenery, or non-brick shapes. | ${finalPrompt}`;
               }

               console.log(`[ImageGenerator] Dispatching for: ${idea.ideaName}`);
               const result = await generateIdeaImage(finalPrompt);
               
               if (!result.ok && !isRetry) {
                 console.log(`[ImageGenerator] Prompt drift or failure detected for ${idea.ideaName}. Retrying once with stricter rules.`);
                 await attemptGeneration(true);
                 return;
               }

               setMessages(current => current.map(m => {
                 if (m.id === assistantMsg.id && m.ideas) {
                   const updatedIdeas = [...m.ideas];
                   updatedIdeas[idx] = { 
                     ...updatedIdeas[idx], 
                     imageUrl: result.ok ? result.dataUrl : undefined, 
                     imageLoading: false,
                     promptDrift: !result.ok // internal flag
                   };
                   return { ...m, ideas: updatedIdeas };
                 }
                 return m;
               }));
            } catch (err) {
               console.error(`[ImageGenerator] Hard Failure for ${idea.ideaName}`, err);
               setMessages(current => current.map(m => {
                 if (m.id === assistantMsg.id && m.ideas) {
                   const updatedIdeas = [...m.ideas];
                   updatedIdeas[idx] = { ...updatedIdeas[idx], imageLoading: false };
                   return { ...m, ideas: updatedIdeas };
                 }
                 return m;
               }));
            }
          };

          await attemptGeneration();
        });

        // Ensure rest of ideas (if > 2) are not stuck in loading
        if (assistantMsg.ideas.length > 2) {
           setMessages(current => current.map(m => {
             if (m.id === assistantMsg.id && m.ideas) {
               const updatedIdeas = m.ideas.map((idea, i) => i >= 2 ? { ...idea, imageLoading: false } : idea);
               return { ...m, ideas: updatedIdeas };
             }
             return m;
           }));
        }
      }

      if (response.suggestedQuickReplies && response.suggestedQuickReplies.length > 0) {
        setQuickReplies(response.suggestedQuickReplies);
      }
      console.log('[IdeasGenerator] request success');
    } catch (err: any) {
      console.error('[IdeasGenerator] request failed:', err);
      const errorMsg: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having a bit of trouble connecting to the cloud right now, but don't let it stop you! Try building a mini tower or a small animal with your current pieces. I'll be back online in a moment.",
        error: true
      };
      setMessages(prev => [...prev, errorMsg]);
      console.log('[IdeasGenerator] fallback shown');
    } finally {
      setIsTyping(false);
      requestInProgress.current = false;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050A18] text-white font-sans">
      {/* Header */}
      <div className="bg-[#0A0F1E]/80 backdrop-blur-xl border-b border-white/10 p-6 pt-[max(env(safe-area-inset-top),1.5rem)] flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Brick Ideas</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Powered by your vault</span>
            </div>
          </div>
        </div>
      </div>

      {allBricks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-700">
           <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center border border-white/10 relative">
              <Camera className="w-10 h-10 text-slate-500" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">Your vault is empty</h2>
              <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-[260px] mx-auto">
                Scan some bricks first and I’ll help turn them into build ideas.
              </p>
           </div>
           <button 
            onClick={() => onNavigate(Screen.SCANNER)}
            className="px-8 py-4 bg-white text-slate-950 font-black rounded-[24px] uppercase tracking-widest shadow-xl active:scale-95 transition-all text-sm"
           >
             Go Scan Bricks
           </button>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 border-blue-400/30' 
                  : 'bg-slate-800 border-white/10'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-orange-500" />}
              </div>
              
              <div className={`max-w-[85%] space-y-4 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div className={`p-4 rounded-[24px] shadow-xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-slate-100 rounded-tl-none border border-white/10'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line font-bold">{msg.content}</p>
                </div>

                {msg.ideas && msg.ideas.length > 0 && (
                  <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {msg.ideas.map((idea, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#1E293B]/80 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md"
                      >
                        <div className="p-6 space-y-4">
                          <div className="w-full aspect-square bg-[#0a0f1e] rounded-[24px] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                             {idea.imageUrl ? (
                               <img 
                                 src={idea.imageUrl} 
                                 alt={idea.ideaName} 
                                 className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000" 
                               />
                             ) : idea.imageLoading ? (
                               <div className="flex flex-col items-center gap-3">
                                 <div className="flex gap-1.5">
                                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Generating preview...</span>
                               </div>
                             ) : (
                               <div className="flex flex-col items-center gap-2 opacity-40">
                                 <Box className="w-10 h-10 text-slate-600" />
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No preview available</span>
                               </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent pointer-events-none" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white tracking-tight">{idea.ideaName}</h3>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {idea.difficulty}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-400 font-medium leading-relaxed italic border-l-2 border-orange-500/10 pl-3">
                            {idea.whyItFitsYourVault}
                          </p>

                          <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                               <Puzzle className="w-3.5 h-3.5 text-orange-500/50" />
                               <span>Build Steps</span>
                            </div>
                            <div className="space-y-2">
                               {idea.buildSteps?.map((step, sidx) => (
                                 <div key={sidx} className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${sidx * 100}ms` }}>
                                   <span className="text-[10px] font-black text-orange-500 w-4 flex-shrink-0">{sidx + 1}</span>
                                   <p className="text-xs text-slate-300 font-bold leading-tight">{step}</p>
                                 </div>
                               ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-[#1E293B] border border-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-orange-500" />
              </div>
              <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 px-6 py-4 rounded-[24px] rounded-tl-none shadow-xl flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {allBricks.length > 0 && (
        <div className="p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] bg-gradient-to-t from-[#050A18] via-[#050A18] to-transparent">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
              {quickReplies.map((reply) => (
                  <button
                      key={reply}
                      onClick={() => handleSend(reply)}
                      disabled={isTyping}
                      className="flex-shrink-0 bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all active:scale-90"
                  >
                      {reply}
                  </button>
              ))}
          </div>
          <div className="bg-[#1E293B] rounded-[30px] p-2 flex items-center border border-white/10 shadow-3xl focus-within:border-orange-500/50 transition-all">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What can we build?"
              className="flex-1 bg-transparent border-none outline-none text-white px-4 font-bold text-sm placeholder:text-slate-700"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !isTyping 
                  ? 'bg-orange-500 text-white shadow-lg active:scale-90' 
                  : 'bg-white/5 text-slate-800'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
