import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Box } from 'lucide-react';
import { Screen, Brick } from '../types';
import { suggestionEngine } from '../services/suggestionEngine';

/**
 * ────────────────────────────────────────────────────
 * IDEAS — CONVERSATIONAL BUILD ADVISOR
 * ────────────────────────────────────────────────────
 * 
 * Chat interface. User asks what to build.
 * System responds with suggestions based on collection.
 * Uses Gemini Flash via suggestionEngine.
 * No "AI" text in UI.
 * ────────────────────────────────────────────────────
 */

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    builds?: BuildSuggestion[];
    timestamp: number;
}

interface BuildSuggestion {
    name: string;
    description: string;
    difficulty: string;
    missingParts?: number;
    partCount?: number;
}

interface IdeasScreenProps {
    onNavigate: (screen: Screen, params?: any) => void;
}

export const IdeasScreen: React.FC<IdeasScreenProps> = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bricks, setBricks] = useState<Brick[]>([]);
    const [brickCount, setBrickCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load collection and send welcome message
    useEffect(() => {
        const stored = localStorage.getItem('hellobrick_collection');
        const parsed = stored ? JSON.parse(stored) : { bricks: [] };
        const loadedBricks: Brick[] = parsed.bricks || [];
        setBricks(loadedBricks);
        setBrickCount(loadedBricks.reduce((sum: number, b: Brick) => sum + b.count, 0));

        // Welcome message
        const welcome: Message = {
            id: 'welcome',
            role: 'assistant',
            text: loadedBricks.length > 0
                ? `Welcome back! I can see you have ${loadedBricks.reduce((s: number, b: Brick) => s + b.count, 0)} bricks in your collection. What would you like to build?`
                : `Welcome! Scan your bricks first, then come back and I'll suggest builds based on what you have.`,
            timestamp: Date.now()
        };

        // Quick suggestions
        const suggestions: Message = {
            id: 'suggestions',
            role: 'system',
            text: 'Try asking:',
            timestamp: Date.now() + 1
        };

        setMessages([welcome, suggestions]);
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const query = input.trim();
        if (!query || isLoading) return;

        const userMsg: Message = {
            id: `user_${Date.now()}`,
            role: 'user',
            text: query,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Build context from collection
            const colorCounts: Record<string, number> = {};
            const typeCounts: Record<string, number> = {};
            bricks.forEach(b => {
                const c = b.color || 'Unknown';
                const t = b.category || b.name || 'Brick';
                colorCounts[c] = (colorCounts[c] || 0) + b.count;
                typeCounts[t] = (typeCounts[t] || 0) + b.count;
            });

            // Get matching builds
            const matchedSets = suggestionEngine.getSuggestions(bricks);
            const creativeIdeas = await suggestionEngine.getSmartCreativeIdeas(bricks, query);

            // Build response
            const buildSuggestions: BuildSuggestion[] = [];

            // Add matched sets
            matchedSets.slice(0, 3).forEach(set => {
                const missing = set.partCount - set.ownedParts;
                buildSuggestions.push({
                    name: set.name,
                    description: missing === 0 ? 'You have all the parts!' : `You're ${missing} parts away.`,
                    difficulty: missing === 0 ? 'Ready' : 'Almost',
                    missingParts: missing,
                    partCount: set.partCount
                });
            });

            // Add creative ideas
            creativeIdeas.forEach((idea: any) => {
                buildSuggestions.push({
                    name: idea.title,
                    description: idea.description,
                    difficulty: idea.difficulty
                });
            });

            const dominantColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([c]) => c)
                .join(', ');

            const responseText = bricks.length > 0
                ? `Based on your collection (${brickCount} bricks, mostly ${dominantColors}), here are some ideas for "${query}":`
                : `Here are some general build ideas for "${query}". Scan your bricks for personalized suggestions!`;

            const assistantMsg: Message = {
                id: `asst_${Date.now()}`,
                role: 'assistant',
                text: responseText,
                builds: buildSuggestions,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, assistantMsg]);

        } catch (err) {
            const errorMsg: Message = {
                id: `err_${Date.now()}`,
                role: 'assistant',
                text: 'Sorry, I had trouble generating ideas. Please try again.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        'What can I build?',
        'Something easy',
        'A vehicle',
        'An animal',
        'A house'
    ];

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-950 font-sans text-white overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                <h1 className="text-xl font-black">Build Ideas</h1>
                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-orange-500/20">
                    <Box className="w-3 h-3" /> {brickCount} bricks
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'user' ? (
                            <div className="max-w-[80%] bg-orange-500 text-white px-4 py-3 rounded-[20px] rounded-br-md font-medium text-sm">
                                {msg.text}
                            </div>
                        ) : msg.role === 'system' ? (
                            <div className="w-full">
                                <p className="text-slate-500 text-xs font-bold mb-2">{msg.text}</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickPrompts.map(prompt => (
                                        <button
                                            key={prompt}
                                            onClick={() => { setInput(prompt); setTimeout(() => handleSend(), 100); }}
                                            className="bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-full text-xs font-bold active:scale-95 transition-all"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-[90%] space-y-2">
                                <div className="bg-slate-800/80 border border-white/5 text-slate-200 px-4 py-3 rounded-[20px] rounded-bl-md text-sm leading-relaxed">
                                    {msg.text}
                                </div>
                                {msg.builds && msg.builds.length > 0 && (
                                    <div className="space-y-2 pl-1">
                                        {msg.builds.map((build, i) => (
                                            <div key={i} className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 active:scale-[0.99] transition-all">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="font-bold text-white text-sm">{build.name}</h4>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                        build.difficulty === 'Ready' ? 'bg-green-500/20 text-green-400' :
                                                        build.difficulty === 'Almost' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-indigo-500/20 text-indigo-400'
                                                    }`}>{build.difficulty}</span>
                                                </div>
                                                <p className="text-slate-400 text-xs leading-relaxed">{build.description}</p>
                                                {build.missingParts !== undefined && build.missingParts > 0 && (
                                                    <p className="text-[10px] text-slate-500 font-bold mt-1.5">{build.missingParts} parts missing of {build.partCount}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/80 border border-white/5 px-4 py-3 rounded-[20px] rounded-bl-md flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                            <span className="text-xs text-slate-400 font-medium">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 pb-[max(calc(env(safe-area-inset-bottom)+80px),96px)] pt-3 border-t border-white/5 bg-slate-950">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="What do you want to build?"
                        className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-2xl text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 disabled:active:scale-100"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};
