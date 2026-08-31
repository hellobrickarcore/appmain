import React, { useState } from 'react';
import { Screen } from '../types';
import { Lightbulb, Sparkles, Bookmark, Zap, Loader2, BookmarkCheck, ArrowRight, Star } from 'lucide-react';

interface IdeasScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface BuildIdea {
  id: string;
  name: string;
  difficulty: Difficulty;
  pieceCount: number;
  matchPercentage: number;
  imageUrl: string;
  isSaved: boolean;
  theme: string;
}

const MOCK_IDEAS: BuildIdea[] = [
  { id: '1', name: 'Rocket Launch Center', difficulty: 'Medium', pieceCount: 145, matchPercentage: 87, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'Space' },
  { id: '2', name: 'Micro Castle', difficulty: 'Hard', pieceCount: 320, matchPercentage: 65, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: true, theme: 'Castle' },
  { id: '3', name: 'Pocket Robot', difficulty: 'Easy', pieceCount: 45, matchPercentage: 98, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'Sci-Fi' },
  { id: '4', name: 'Speedster Car', difficulty: 'Medium', pieceCount: 110, matchPercentage: 78, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'City' },
  { id: '5', name: 'Bonsai Tree', difficulty: 'Hard', pieceCount: 450, matchPercentage: 42, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: true, theme: 'Botanical' },
  { id: '6', name: 'Pirate Raft', difficulty: 'Easy', pieceCount: 65, matchPercentage: 92, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'Pirates' },
  { id: '7', name: 'Cyberpunk Speeder', difficulty: 'Medium', pieceCount: 180, matchPercentage: 71, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'Sci-Fi' },
  { id: '8', name: 'Dragon Whelp', difficulty: 'Hard', pieceCount: 290, matchPercentage: 55, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'Fantasy' },
  { id: '9', name: 'Lunar Rover', difficulty: 'Medium', pieceCount: 130, matchPercentage: 84, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'Space' },
  { id: '10', name: 'Ice Cream Stand', difficulty: 'Easy', pieceCount: 85, matchPercentage: 95, imageUrl: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop', isSaved: false, theme: 'City' },
];

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

type FilterType = 'All' | Difficulty;

export const IdeasScreen: React.FC<IdeasScreenProps> = ({ onNavigate }) => {
  const [ideas, setIdeas] = useState<BuildIdea[]>(MOCK_IDEAS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<FilterType>('All');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIdeas(prev => [...prev].sort(() => Math.random() - 0.5));
    }, 1500);
  };

  const toggleSave = (id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, isSaved: !idea.isSaved } : idea
    ));
  };

  const filteredIdeas = ideas.filter(idea => filter === 'All' || idea.difficulty === filter);
  const savedIdeas = ideas.filter(idea => idea.isSaved);

  const IdeaCard = ({ idea, compact = false }: { idea: BuildIdea, compact?: boolean }) => (
    <div 
      onClick={() => alert(`MOC Instructions for ${idea.name} are unlocked in the Premium Tier!`)}
      className={`relative group rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${compact ? 'flex flex-row' : 'flex flex-col'}`}>
      
      {/* Real LEGO Model Thumbnail */}
      <div className={`${compact ? 'w-24 h-24 shrink-0' : 'h-36 w-full'} bg-gray-50 relative flex items-center justify-center p-2 border-b border-gray-100 overflow-hidden`}>
        <img 
          src={idea.imageUrl} 
          alt={idea.name} 
          className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop';
          }}
        />
        {!compact && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center space-x-1 border border-gray-200/60 shadow-sm">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span className="text-[11px] font-bold text-emerald-600">{idea.matchPercentage}% Match</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`font-bold text-gray-900 leading-tight ${compact ? 'text-sm' : 'text-lg'}`}>{idea.name}</h3>
            <button 
              onClick={() => toggleSave(idea.id)}
              className="p-1.5 -mr-1.5 -mt-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              {idea.isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-purple-400" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-700" />
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${DIFFICULTY_COLORS[idea.difficulty]}`}>
              {idea.difficulty}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-300 bg-gray-50 text-gray-700 uppercase tracking-wider">
              {idea.pieceCount} pcs
            </span>
            {compact && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                {idea.matchPercentage}%
              </span>
            )}
          </div>
        </div>

        {!compact && (
          <button className="w-full mt-2 py-2.5 rounded-xl bg-gray-50 hover:bg-slate-700 text-gray-800 text-sm font-semibold transition-colors flex items-center justify-center space-x-2 group-hover:bg-purple-600 group-hover:text-gray-900">
            <span>View Instructions</span>
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-[#F5F5F7] pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),6rem)] text-gray-900 overflow-y-auto">
      
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#F5F5F7]/80 backdrop-blur-xl z-20 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Lightbulb className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Build Ideas</h1>
        </div>
      </div>

      {/* Hero / Generate Section */}
      <div className="px-6 py-6">
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 blur-xl"></div>
          <div className="relative bg-[#F5F5F7] rounded-3xl p-6 text-center z-10">
            <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">What Can I Build?</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-[250px] mx-auto">
              Discover unique builds based on the pieces you already own.
            </p>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full relative group overflow-hidden rounded-2xl bg-slate-100 text-slate-900 font-bold py-3.5 px-6 transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <span>Analyzing Collection...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span>Generate New Ideas</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['All', 'Easy', 'Medium', 'Hard'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === f 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="px-6 mb-10">
        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <span>Top Matches</span>
          <span className="bg-gray-50 text-gray-700 text-xs px-2 py-0.5 rounded-full">{filteredIdeas.length}</span>
        </h3>
        
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-500 rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No ideas found for this filter.</p>
          </div>
        )}
      </div>

      {/* Saved Ideas */}
      {savedIdeas.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-purple-400" />
              <span>Saved Ideas</span>
            </h3>
          </div>
          
          <div className="space-y-3">
            {savedIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} compact={true} />
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};
