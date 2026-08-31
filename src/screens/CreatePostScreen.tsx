import React, { useState } from 'react';
import { Screen } from '../types';
import { ChevronLeft, Image as ImageIcon, X, Search, Tag } from 'lucide-react';

interface Props {
  onNavigate: (screen: Screen, params?: any) => void;
}

const MOCK_COLLECTION_SETS = [
  { id: '10316', name: 'Rivendell' },
  { id: '75192', name: 'Millennium Falcon' },
  { id: '10305', name: 'Lion Knights\' Castle' },
  { id: '42143', name: 'Ferrari Daytona SP3' },
  { id: '21333', name: 'The Starry Night' },
];

export const CreatePostScreen: React.FC<Props> = ({ onNavigate }) => {
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<typeof MOCK_COLLECTION_SETS>([]);
  const [isSearchingTags, setIsSearchingTags] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const MAX_CHARS = 500;

  const handleSimulateImageSelect = () => {
    // In a real app, this would use Capacitor Camera/Filesystem API
    setImagePreview('https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80');
  };

  const handlePost = () => {
    // Submit post logic
    onNavigate(Screen.Feed);
  };

  const toggleTag = (set: typeof MOCK_COLLECTION_SETS[0]) => {
    if (selectedTags.find(t => t.id === set.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== set.id));
    } else {
      setSelectedTags([...selectedTags, set]);
    }
  };

  const filteredSets = MOCK_COLLECTION_SETS.filter(
    set => set.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) || set.id.includes(tagSearchQuery)
  );

  return (
    <div className="h-full bg-[#F5F5F7] text-gray-900 flex flex-col w-full z-50">
      {/* Header */}
      <div className="pt-[max(env(safe-area-inset-top),2.5rem)] px-4 pb-3 flex items-center justify-between bg-white border-b border-gray-200">
        <button 
          onClick={() => onNavigate(Screen.Feed)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">New Post</h1>
        <button 
          onClick={handlePost}
          disabled={!imagePreview && caption.length === 0}
          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-500 disabled:bg-gray-50 disabled:text-gray-400 text-gray-900 rounded-full font-medium transition-colors"
        >
          Post
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Photo Upload Area */}
        <div 
          onClick={handleSimulateImageSelect}
          className={`relative w-full aspect-square bg-white flex flex-col items-center justify-center border-b border-gray-200 transition-colors cursor-pointer ${!imagePreview && 'hover:bg-gray-50'}`}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                className="absolute top-4 right-4 p-2 bg-gray-500 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white/70 transition-colors"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-emerald-400">
                <ImageIcon size={32} />
              </div>
              <p className="text-gray-700 font-medium">Tap to add photo</p>
              <p className="text-gray-400 text-sm mt-1">Show off your latest build</p>
            </>
          )}
        </div>

        {/* Caption Input */}
        <div className="p-4 border-b border-gray-200">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 resize-none outline-none text-base min-h-[100px]"
            maxLength={MAX_CHARS}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${caption.length > MAX_CHARS - 20 ? 'text-orange-400' : 'text-gray-400'}`}>
              {caption.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Tags Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Tag size={16} />
              Tag Sets
            </h2>
            <button 
              onClick={() => setIsSearchingTags(!isSearchingTags)}
              className="text-emerald-500 text-sm font-medium"
            >
              {isSearchingTags ? 'Done' : 'Add'}
            </button>
          </div>

          {/* Selected Tags Chips */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTags.map(tag => (
                <div key={tag.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-blue-300 rounded-full text-sm">
                  <span>{tag.id} {tag.name}</span>
                  <button onClick={() => toggleTag(tag)} className="p-0.5 hover:bg-emerald-500/20 rounded-full">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tag Search Area */}
          {isSearchingTags && (
            <div className="bg-white rounded-xl p-3 border border-gray-200 animate-in fade-in slide-in-from-top-2">
              <div className="relative mb-3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  placeholder="Search your collection..."
                  className="w-full bg-[#F5F5F7] text-gray-800 placeholder:text-slate-600 rounded-lg py-2 pl-10 pr-4 outline-none border border-gray-200 focus:border-emerald-500/50"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1">
                {filteredSets.length > 0 ? (
                  filteredSets.map(set => {
                    const isSelected = selectedTags.some(t => t.id === set.id);
                    return (
                      <button
                        key={set.id}
                        onClick={() => toggleTag(set)}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm truncate pr-2">{set.id} - {set.name}</span>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No sets found in collection.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
