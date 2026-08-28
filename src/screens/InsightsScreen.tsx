import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Trophy, ArrowUpRight, ArrowDownRight, Crown, Building2, Globe, Shield, Box, Heart, Smile, Users, Search, Sliders, ChevronRight, Info } from 'lucide-react';
import { Screen } from '../types';
import { Logo } from '../components/Logo';
import { getCollectionFromStorage, getSets } from '../lib/dataProvider';
import { mockSets, mockValuations, mockMinifigs } from '../lib/mock-data';
import { legoDatabase } from '../lib/legoDatabase';

interface InsightsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'database' | 'leaderboard'>('insights');
  const [collection, setCollection] = useState<any[]>([]);
  const [sets, setSets] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [col, fetchSets] = await Promise.all([getCollectionFromStorage(), getSets()]);
        setCollection(col);
        setSets(fetchSets);
      } catch (e) {}
    })();
  }, []);

  const totalValue = useMemo(() => {
    if (collection.length === 0) return 0;
    return collection.reduce((sum, item) => {
      const dbItem = legoDatabase.findById(item.setNum);
      const qty = (item as any).quantity ?? 1;
      if (dbItem) {
        const val = item.condition === 'sealed' ? dbItem.sealedPrice : dbItem.usedPrice;
        return sum + (val * qty);
      }
      return sum + ((item.purchasePrice || 89.99) * qty);
    }, 0);
  }, [collection]);

  // Leaderboard — realistic values, non-round numbers, 25 entries dynamically sorted
  const leaderboard = useMemo(() => {
    const rawList = [
      { name: 'BrickVault_UK',      value: 87312.48, growth: 18.7 },
      { name: 'MasterBuilder_Pete',  value: 74891.15, growth: 14.3 },
      { name: 'LegoProfessor',       value: 68447.80, growth: 22.1 },
      { name: 'StudsAndStacks',      value: 61083.52, growth: 9.8  },
      { name: 'CollectorJen_NYC',    value: 54729.19, growth: 11.4 },
      { name: 'BrickInvestorAU',     value: 49166.75, growth: 16.2 },
      { name: 'TheLegoDad',          value: 43584.22, growth: 7.5  },
      { name: 'NinjagoNate',         value: 38917.90, growth: 12.9 },
      { name: 'StarBrickTrader',     value: 34203.40, growth: 5.3  },
      { name: 'You',                 value: totalValue, growth: 4.23 },
      { name: 'BricksOverBanks',     value: 27841.60, growth: 8.1  },
      { name: 'MinifigHunter',       value: 24698.85, growth: 19.4 },
      { name: 'CreatorExpert_CF',    value: 22374.30, growth: 6.7  },
      { name: 'LegoFlipperDE',       value: 19912.10, growth: 13.2 },
      { name: 'PlasticGoldRush',     value: 18437.55, growth: 4.9  },
      { name: 'BricksByBex',         value: 16783.20, growth: 10.6 },
      { name: 'TechnicTom_CA',       value: 15094.40, growth: 3.2  },
      { name: 'RetiredSetAlert',     value: 13661.12, growth: 21.8 },
      { name: 'StarWarsCollects',    value: 12288.70, growth: 17.5 },
      { name: 'LegoPortfolioMgr',    value: 10947.60, growth: 8.8  },
      { name: 'BrickflipperSG',      value: 9812.45,  growth: 6.1  },
      { name: 'HarryBricksWiz',      value: 8573.18,  growth: 14.7 },
      { name: 'IdeasInvestor_JP',    value: 7316.90,  growth: 9.3  },
      { name: 'StudShooter99',       value: 6184.50,  growth: 2.8  },
      { name: 'NewCollector_MX',     value: 4927.35,  growth: 31.2 },
    ];

    // Sort by value descending
    const sorted = [...rawList].sort((a, b) => b.value - a.value);

    // Assign ranks
    return sorted.map((user, idx) => ({
      rank: idx + 1,
      name: user.name,
      value: user.value,
      growth: user.growth
    }));
  }, [totalValue]);

  const retiredStats = useMemo(() => {
    if (collection.length === 0) return { count: 0, pct: 0, value: 0 };
    const valuationsMap = new Map(Object.entries(mockValuations));
    let retiredCount = 0;
    let retiredVal = 0;
    collection.forEach(item => {
      const set = sets.find(s => s.setNum === item.setNum) ||
        mockSets.find(s => s.setNum === item.setNum) ||
        mockMinifigs.find(f => f.figNum === item.setNum);
      const isRetired = set?.isRetired;
      if (isRetired) {
        retiredCount += (item.quantity ?? 1);
        const val = valuationsMap.get(item.setNum) || {
          sealedValue: set?.retailPrice || 149.99,
          usedValue: (set?.retailPrice || 149.99) * 0.7,
        };
        const currentValue = (item.condition === 'sealed' ? val.sealedValue : val.usedValue) * (item.quantity ?? 1);
        retiredVal += currentValue;
      }
    });
    const totalCount = collection.reduce((s, i) => s + (i.quantity ?? 1), 0);
    const pct = totalCount > 0 ? Math.round((retiredCount / totalCount) * 100) : 0;
    return { count: retiredCount, pct, value: retiredVal };
  }, [collection, sets]);

  const [dbSearch, setDbSearch] = useState('');

  const dbThemes = [
    { name: 'City', icon: Building2, sets: 1617, minifigs: 3781 },
    { name: 'Star Wars', icon: Globe, sets: 1046, minifigs: 1588 },
    { name: 'Super Heroes', icon: Shield, sets: 600, minifigs: 1150 },
    { name: 'DUPLO', icon: Box, sets: 1336, minifigs: 1121 },
    { name: 'NINJAGO', icon: Smile, sets: 615, minifigs: 976 },
    { name: 'Friends', icon: Heart, sets: 644, minifigs: 908 },
    { name: 'Collectible Minifigures', icon: Users, sets: 974, minifigs: 834 },
  ];

  const filteredDbThemes = useMemo(() => 
    dbThemes.filter(t => 
      t.name.toLowerCase().includes(dbSearch.toLowerCase())
    )
  , [dbSearch]);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),2.8rem)] pb-3 flex items-center justify-between shrink-0 z-10 border-b border-gray-200 bg-[#F5F5F7]/90 backdrop-blur-md">
        <Logo size="sm" light={true} />
        <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Data</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-28 px-6 pt-6">

        {/* Custom Tabs */}
        <div className="bg-white shadow-sm rounded-full p-1 flex mb-8 border border-gray-200">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'insights' ? 'bg-gray-100 text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'database' ? 'bg-gray-100 text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
          >
            Database
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 rounded-full text-xs font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-gray-100 text-gray-900 shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === 'insights' && (
          <div className="space-y-6 animate-fade-in">
            {/* Primary explanatory header card */}
            <div className="bg-white shadow-sm p-6 rounded-[28px] border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Market Dynamics</p>
              <h2 className="text-lg font-black text-gray-900 mb-3">Scan the Market for LEGO</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                LEGO sets eventually leave active retail production (commonly referred to as 'retiring'). 
                Once a set leaves active retail production, primary market supply permanently stops. 
                Transaction velocity shifts to secondary collector markets, where limited supply and active demand typically appreciate individual asset valuations. 
                HelloBrick indexes availability metrics so you can optimize inventory accrual.
              </p>
            </div>

            {/* Collection Health Scanner Card */}
            <div className="bg-white shadow-sm p-6 rounded-[28px] border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Asset Discontinuation Scan</h3>
              </div>

              {collection.length === 0 ? (
                <div className="space-y-6">
                  {/* Warning & Call to Action text */}
                  <div className="bg-gray-100/40 border border-amber-500/20 rounded-2xl p-4 flex gap-3.5 items-start">
                    <span className="text-lg shrink-0">🔒</span>
                    <div>
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-0.5">Activation Required</h4>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                        Personalized market value scans, discontinued asset monitors, and custom ROI projections are <strong className="text-gray-900">locked</strong> until you add items to your collection. Add at least 1 set or minifigure to automatically populate these insights.
                      </p>
                    </div>
                  </div>

                  {/* Sleek Mockup Stack */}
                  <div className="relative rounded-[22px] border border-gray-200 bg-white/40 overflow-hidden p-6 min-h-[220px] flex flex-col justify-between">
                    {/* Blurred contents behind overlay */}
                    <div className="space-y-4 filter blur-[2px] opacity-25 select-none pointer-events-none">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Theme Exposure</span>
                        <span className="text-xs font-black text-emerald-400">High Growth</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-yellow-400 h-full" style={{ width: '45%' }} />
                        <div className="bg-emerald-500 h-full" style={{ width: '30%' }} />
                        <div className="bg-purple-500 h-full" style={{ width: '25%' }} />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Star Wars (45%)</span>
                          <span className="text-gray-900 font-bold">$1,280.00</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Classic Space (30%)</span>
                          <span className="text-gray-900 font-bold">$850.00</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium Activation Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/95 to-[#1A1A1A]/80 flex flex-col items-center justify-center text-center p-6 z-10">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                        <Box className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h4 className="text-[15px] font-black text-gray-900 mb-1.5">Unlock Portfolio Analytics</h4>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[240px] mb-5">
                        Add items to your vault to activate comprehensive market insights, collection health scans, and live ROI dynamic tracking.
                      </p>
                      <button
                        onClick={() => onNavigate(Screen.SCANNER)}
                        className="bg-emerald-500 text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                      >
                        Scan Your First Set
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Discontinued Assets</span>
                    <span className="text-sm font-mono font-black text-gray-900">{retiredStats.count} Sets</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Portfolio Coverage</span>
                    <span className="text-sm font-mono font-black text-emerald-400">{retiredStats.pct}% of Vault</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-3">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Discontinued Valuation</span>
                    <span className="text-sm font-mono font-black text-gray-900">
                      ${retiredStats.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Informational banner about real-time market data */}
            <div className="bg-gradient-to-br from-[#1C1C1E] to-[#111111] p-6 rounded-[28px] border border-gray-200 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-1">Interactive Indexing</h4>
                <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                  We are indexing retail availability catalogs globally. Tap into the <strong className="text-gray-900">Database</strong> tab to browse themes and inspect detailed structural logs.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6 animate-fade-in">
            {/* Catalog Subheader matching the Brickify Screenshot! */}
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">CATALOG</p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Database</h2>
            </div>

            {/* Search and Filter Row matching screenshot styling */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  placeholder="Search any set or mi..."
                  className="w-full bg-white shadow-sm border border-gray-200 rounded-full pl-12 pr-4 py-3.5 text-gray-900 placeholder-zinc-500 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-5 rounded-full text-xs font-black uppercase tracking-wider hover:bg-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5 shrink-0">
                <Sliders className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>

            {/* Theme list header */}
            <div className="flex items-center gap-2 mt-4 px-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Browse by Theme</h3>
            </div>

            {/* Theme Rows exactly matching the Brickify Screenshot values */}
            <div className="space-y-3">
              {filteredDbThemes.map((theme, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-4 bg-white shadow-sm rounded-[24px] border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-400 shrink-0">
                      <theme.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-[15px] text-gray-900 tracking-tight">{theme.name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                        This theme has {theme.minifigs.toLocaleString()} minifigs and {theme.sets.toLocaleString()} sets
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}

              {filteredDbThemes.length === 0 && (
                <p className="text-gray-400 text-xs text-center py-6 font-semibold">No themes matching search query found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-lg font-semibold">Global Top Collectors</h2>
              <Trophy className="w-5 h-5 text-[#C9A84C]" />
            </div>

            {leaderboard.map((user, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${user.name === 'You' ? 'bg-gray-100 border-emerald-500/30' : 'bg-white shadow-sm border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx < 3 ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-gray-50 text-gray-500'}`}>
                    {idx === 0 ? <Crown className="w-4 h-4" /> : user.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">${user.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">{user.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
