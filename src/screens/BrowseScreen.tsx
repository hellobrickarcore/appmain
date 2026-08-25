import React, { useState, useMemo } from 'react';
import { Screen } from '../types';
import { Search, Filter, Plus, Heart, ChevronDown, Check, Star } from 'lucide-react';

interface BrowseScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

interface LegoSet {
  id: string;
  setNum: string;
  name: string;
  theme: string;
  pieces: number;
  marketValue: number;
  year: number;
  retired: boolean;
  minifigures?: number;
}

const THEMES = ['All', 'Star Wars', 'City', 'Technic', 'Creator', 'Harry Potter', 'Icons', 'Marvel', 'Ideas', 'Architecture'];
const SORT_OPTIONS = [
  { label: 'Recently Released', value: 'recent' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Alphabetical', value: 'alpha' },
];
const YEARS = ['All', '2024', '2023', '2022', '2021', '2020', '2019'];

const MOCK_DATA: LegoSet[] = [
  { id: '1', setNum: '75192-1', name: 'Millennium Falcon', theme: 'Star Wars', pieces: 7541, marketValue: 849.99, year: 2017, retired: false },
  { id: '2', setNum: '10316-1', name: 'The Lord of the Rings: Rivendell', theme: 'Icons', pieces: 6167, marketValue: 499.99, year: 2023, retired: false },
  { id: '3', setNum: '75331-1', name: 'The Razor Crest', theme: 'Star Wars', pieces: 6187, marketValue: 599.99, year: 2022, retired: false },
  { id: '4', setNum: '10305-1', name: 'Lion Knights\' Castle', theme: 'Icons', pieces: 4514, marketValue: 399.99, year: 2022, retired: false },
  { id: '5', setNum: '42115-1', name: 'Lamborghini Sián FKP 37', theme: 'Technic', pieces: 3696, marketValue: 449.99, year: 2020, retired: false },
  { id: '6', setNum: '71043-1', name: 'Hogwarts Castle', theme: 'Harry Potter', pieces: 6020, marketValue: 469.99, year: 2018, retired: false },
  { id: '7', setNum: '76178-1', name: 'Daily Bugle', theme: 'Marvel', pieces: 3772, marketValue: 349.99, year: 2021, retired: false },
  { id: '8', setNum: '21330-1', name: 'Home Alone', theme: 'Ideas', pieces: 3955, marketValue: 299.99, year: 2021, retired: false },
  { id: '9', setNum: '21056-1', name: 'Taj Mahal', theme: 'Architecture', pieces: 2022, marketValue: 119.99, year: 2021, retired: true },
  { id: '10', setNum: '60337-1', name: 'Express Passenger Train', theme: 'City', pieces: 764, marketValue: 189.99, year: 2022, retired: false },
  { id: '11', setNum: '75252-1', name: 'Imperial Star Destroyer', theme: 'Star Wars', pieces: 4784, marketValue: 950.00, year: 2019, retired: true },
  { id: '12', setNum: '42143-1', name: 'Ferrari Daytona SP3', theme: 'Technic', pieces: 3778, marketValue: 449.99, year: 2022, retired: false },
  { id: '13', setNum: '31120-1', name: 'Medieval Castle', theme: 'Creator', pieces: 1426, marketValue: 99.99, year: 2021, retired: false },
  { id: '14', setNum: '10294-1', name: 'Titanic', theme: 'Icons', pieces: 9090, marketValue: 679.99, year: 2021, retired: false },
  { id: '15', setNum: '21333-1', name: 'Vincent van Gogh - The Starry Night', theme: 'Ideas', pieces: 2316, marketValue: 169.99, year: 2022, retired: false },
  { id: '16', setNum: '76210-1', name: 'Hulkbuster', theme: 'Marvel', pieces: 4049, marketValue: 549.99, year: 2022, retired: false },
  { id: '17', setNum: '75313-1', name: 'AT-AT', theme: 'Star Wars', pieces: 6785, marketValue: 849.99, year: 2021, retired: false },
  { id: '18', setNum: '21058-1', name: 'Great Pyramid of Giza', theme: 'Architecture', pieces: 1476, marketValue: 129.99, year: 2022, retired: false },
  { id: '19', setNum: '76405-1', name: 'Hogwarts Express - Collectors\' Edition', theme: 'Harry Potter', pieces: 5129, marketValue: 499.99, year: 2022, retired: false },
  { id: '20', setNum: '60324-1', name: 'Mobile Crane', theme: 'City', pieces: 340, marketValue: 39.99, year: 2022, retired: false },
];

export const BrowseScreen: React.FC<BrowseScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  // Simulated added state for demo purposes
  const [addedToCollection, setAddedToCollection] = useState<Record<string, boolean>>({});
  const [addedToWishlist, setAddedToWishlist] = useState<Record<string, boolean>>({});

  const toggleCollection = (id: string) => {
    setAddedToCollection(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleWishlist = (id: string) => {
    setAddedToWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAndSortedSets = useMemo(() => {
    let result = [...MOCK_DATA];

    // Filter by search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(set => 
        set.name.toLowerCase().includes(lowerQuery) || 
        set.setNum.toLowerCase().includes(lowerQuery) ||
        set.theme.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by theme
    if (selectedTheme !== 'All') {
      result = result.filter(set => set.theme === selectedTheme);
    }

    // Filter by year
    if (selectedYear !== 'All') {
      result = result.filter(set => set.year === parseInt(selectedYear));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_desc':
          return b.marketValue - a.marketValue;
        case 'price_asc':
          return a.marketValue - b.marketValue;
        case 'alpha':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          return b.year - a.year;
      }
    });

    return result;
  }, [searchQuery, selectedTheme, selectedYear, sortBy]);

  return (
    <div className="flex flex-col h-full w-full bg-[#F5F5F7] text-gray-900 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),6rem)]">
      
      {/* Header & Search */}
      <div className="px-4 pb-4 sticky top-0 z-20 bg-[#F5F5F7]/80 backdrop-blur-lg border-b border-gray-200">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Database</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-500 text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all shadow-inner"
            placeholder="Search by name, set number, or theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters (Theme, Year, Sort) */}
      <div className="z-10 bg-[#F5F5F7]">
        {/* Themes Horizontal Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-2 border-b border-gray-200/50">
          {THEMES.map(theme => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTheme === theme 
                  ? 'bg-emerald-500 text-gray-900 shadow-md shadow-blue-500/20' 
                  : 'bg-gray-50 text-gray-700 hover:bg-slate-700'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Year and Sort Dropdowns */}
        <div className="flex px-4 py-3 gap-3 border-b border-gray-200/50">
          
          {/* Sort Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={() => { setIsSortOpen(!isSortOpen); setIsYearOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-500" />
                <span className="truncate">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg shadow-xl z-30 overflow-hidden">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-slate-700 flex justify-between items-center"
                  >
                    {option.label}
                    {sortBy === option.value && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative flex-1">
            <button 
              onClick={() => { setIsYearOpen(!isYearOpen); setIsSortOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="truncate">Year: {selectedYear}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {isYearOpen && (
              <div className="absolute top-full right-0 mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg shadow-xl z-30 overflow-hidden max-h-48 overflow-y-auto">
                {YEARS.map(year => (
                  <button
                    key={year}
                    onClick={() => { setSelectedYear(year); setIsYearOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-slate-700 flex justify-between items-center"
                  >
                    {year}
                    {selectedYear === year && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid / List of Sets */}
      <div className="flex-1 overflow-y-auto px-4 py-4" onClick={() => { setIsSortOpen(false); setIsYearOpen(false); }}>
        
        {filteredAndSortedSets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No sets found</h3>
            <p className="text-gray-400 text-sm max-w-[250px]">
              We couldn't find any LEGO sets matching your current search and filters.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTheme('All'); setSelectedYear('All'); }}
              className="mt-6 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAndSortedSets.map((set, index) => (
              <div 
                key={set.id}
                className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm hover:border-gray-300 transition-all duration-300 group"
                style={{ 
                  animation: `fadeInUp 0.4s ease-out forwards`,
                  animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
                  opacity: 0,
                  transform: 'translateY(10px)'
                }}
              >
                {/* Custom keyframes injected via style tag for simplicity in this component */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes fadeInUp {
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}} />
                
                <div className="flex h-32 relative">
                  {/* Image Area */}
                  <div className="w-1/3 bg-[#F5F5F7] p-2 flex items-center justify-center relative border-r border-gray-200/50">
                    <img 
                      src={`https://img.bricklink.com/ItemImage/SN/0/${set.setNum}.png`}
                      alt={set.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/0f172a/334155?text=No+Image';
                      }}
                    />
                    {set.retired && (
                      <div className="absolute top-2 left-2 bg-red-500/90 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        RETIRED
                      </div>
                    )}
                  </div>
                  
                  {/* Info Area */}
                  <div className="w-2/3 p-3 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-medium text-emerald-500 mb-1">{set.theme} • {set.year}</div>
                      <div className="text-xs font-mono text-gray-400 bg-[#F5F5F7] px-1.5 py-0.5 rounded">{set.setNum}</div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{set.name}</h3>
                    
                    <div className="mt-auto flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{set.pieces} pcs</span>
                        <span className="text-sm font-bold text-emerald-400">${set.marketValue.toFixed(2)}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(set.id); }}
                          className={`p-1.5 rounded-full transition-colors ${
                            addedToWishlist[set.id] 
                              ? 'bg-pink-500/20 text-pink-500' 
                              : 'bg-gray-50 text-gray-500 hover:bg-slate-700'
                          }`}
                        >
                          <Heart className="w-4 h-4" fill={addedToWishlist[set.id] ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleCollection(set.id); }}
                          className={`p-1.5 rounded-full transition-colors ${
                            addedToCollection[set.id] 
                              ? 'bg-emerald-500/20 text-emerald-500' 
                              : 'bg-emerald-500 text-gray-900 hover:bg-blue-600 shadow-md shadow-blue-500/20'
                          }`}
                        >
                          {addedToCollection[set.id] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
