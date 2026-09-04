import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../types';
import { Users, TrendingUp, ShieldCheck, Trophy, Zap, Activity } from 'lucide-react';

interface CommunityScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
}

interface CommunityMember {
  id: string;
  name: string;
  handle: string;
  avatar: string; // ONLY FIGURINE IMAGES
  badge: string;
  badgeColor: string;
  vaultValue: number;
  itemCount: number;
  featuredCategory: string;
  topAsset: string;
  topAssetImg: string;
  gain30D: string;
  collectionSummary: string;
}

const COMMUNITY_MEMBERS: CommunityMember[] = [
  {
    id: 'm1',
    name: 'Marcus Vance',
    handle: '@VanceVault',
    avatar: 'https://img.bricklink.com/ItemImage/MN/0/sw0107.png', // Boba Fett Minifig
    badge: 'Grail Master',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    vaultValue: 48920,
    itemCount: 184,
    featuredCategory: 'Star Wars UCS & Vintage TCG',
    topAsset: 'Millennium Falcon UCS #75192',
    topAssetImg: 'https://img.bricklink.com/ItemImage/SN/0/75192-1.png',
    gain30D: '+8.4%',
    collectionSummary: '42 Sets · 680 Minifigs · 74 Cards'
  },
  {
    id: 'm2',
    name: 'Elena Rostova',
    handle: '@Elena_Cards',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', // Pikachu Figurine
    badge: 'Holo Hunter',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    vaultValue: 36450,
    itemCount: 312,
    featuredCategory: 'Pokémon 151 & Evolving Skies',
    topAsset: 'Charizard ex 151 (Special Illustration Rare)',
    topAssetImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    gain30D: '+12.1%',
    collectionSummary: '280 Cards · 18 Graded PSA 10 · 14 Sets'
  },
  {
    id: 'm3',
    name: 'Kenji Takahashi',
    handle: '@KenjiTokyo',
    avatar: 'https://img.bricklink.com/ItemImage/MN/0/col160.png', // Mr. Gold Minifig
    badge: 'Vintage Curator',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
    vaultValue: 28700,
    itemCount: 128,
    featuredCategory: 'Japanese Vintage Holo & Promos',
    topAsset: 'Alakazam Holo (Gen 1 Japanese)',
    topAssetImg: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png',
    gain30D: '+6.2%',
    collectionSummary: '96 Japanese Cards · 32 Minifigs'
  },
  {
    id: 'm4',
    name: 'Sarah Chen',
    handle: '@BrickArchitect',
    avatar: 'https://img.bricklink.com/ItemImage/MN/0/sw0450.png', // Captain Rex Minifig
    badge: 'Master Builder',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    vaultValue: 22400,
    itemCount: 95,
    featuredCategory: 'Modular Buildings & Icons',
    topAsset: "Lion Knights' Castle #10305",
    topAssetImg: 'https://img.bricklink.com/ItemImage/SN/0/10305-1.png',
    gain30D: '+4.5%',
    collectionSummary: '58 Sets · 420 Minifigs'
  },
  {
    id: 'm5',
    name: 'David O’Connor',
    handle: '@DaveMTG',
    avatar: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg', // Black Lotus Figurine Card
    badge: 'Power 9 Vault',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    vaultValue: 18950,
    itemCount: 64,
    featuredCategory: 'Magic The Gathering Vintage',
    topAsset: 'The One Ring (Serialized)',
    topAssetImg: 'https://cards.scryfall.io/large/front/0/6/06700c0f-6212-42c2-9a3d-49fa297092c6.jpg',
    gain30D: '+9.3%',
    collectionSummary: '64 MTG Cards · 12 Sealed Draft Boxes'
  },
  {
    id: 'm6',
    name: 'Liam Miller',
    handle: '@MillerMinifigs',
    avatar: 'https://img.bricklink.com/ItemImage/MN/0/sw0603.png', // Shadow Trooper Minifig
    badge: 'Army Builder',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    vaultValue: 14200,
    itemCount: 450,
    featuredCategory: '501st & Shadow Clone Army',
    topAsset: 'Boba Fett (Cloud City #sw0107)',
    topAssetImg: 'https://img.bricklink.com/ItemImage/MN/0/sw0107.png',
    gain30D: '+5.1%',
    collectionSummary: '450 Minifigs · 22 Battle Packs'
  },
  {
    id: 'm7',
    name: 'Chloe Dubois',
    handle: '@ChloeLorcana',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/700.png', // Sylveon Figurine
    badge: 'Enchanted Finder',
    badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
    vaultValue: 9850,
    itemCount: 140,
    featuredCategory: 'Disney Lorcana & One Piece',
    topAsset: 'Elsa Spirit of Winter (Enchanted)',
    topAssetImg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    gain30D: '+14.2%',
    collectionSummary: '110 Lorcana Cards · 30 One Piece'
  },
  {
    id: 'm8',
    name: 'Tom Bradley',
    handle: '@Tom_Retro',
    avatar: 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue Eyes Card Figurine
    badge: 'Classic Collector',
    badgeColor: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
    vaultValue: 6420,
    itemCount: 88,
    featuredCategory: 'Yu-Gi-Oh! LOB 1st Edition',
    topAsset: 'Blue-Eyes White Dragon (LOB-001)',
    topAssetImg: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    gain30D: '+3.8%',
    collectionSummary: '72 YGO Cards · 16 Retro Sets'
  }
];

const EVENT_POOL = [
  { user: 'Elena R.', action: 'added Charizard ex (151 SIR)', val: '+$125' },
  { user: 'Marcus V.', action: 'verified Millennium Falcon UCS', val: '+$940' },
  { user: 'David O.', action: 'indexed Black Lotus (Alpha)', val: '+$85,000' },
  { user: 'Liam M.', action: 'added Captain Rex Phase 2 #sw0450', val: '+$298' },
  { user: 'Kenji T.', action: 'scanned Buneary 0427 Holo', val: '+$24' },
  { user: 'Sarah C.', action: 'added Rivendell #10316', val: '+$580' },
  { user: 'Chloe D.', action: 'verified Elsa Spirit of Winter (Enchanted)', val: '+$750' },
  { user: 'Tom B.', action: 'added Blue-Eyes White Dragon 1st Ed', val: '+$2,800' },
  { user: 'Alex P.', action: 'scanned Mr. Gold Chrome CMF', val: '+$4,200' },
  { user: 'Maya S.', action: 'indexed The One Ring Serialized', val: '+$850,000' },
  { user: 'Jordan K.', action: 'added 1986 Fleer Michael Jordan #57', val: '+$3,200' },
  { user: 'Lucas W.', action: 'scanned 501st Legion Clone Trooper', val: '+$22' }
];

export const CommunityScreen: React.FC<CommunityScreenProps> = ({ onNavigate }) => {
  const [pulses, setPulses] = useState([
    { id: 1, user: 'Elena R.', action: 'added Charizard ex (151 SIR)', time: 'Just now', val: '+$125' },
    { id: 2, user: 'Marcus V.', action: 'verified Millennium Falcon UCS', time: '14s ago', val: '+$940' },
    { id: 3, user: 'David O.', action: 'indexed Black Lotus (Alpha)', time: '38s ago', val: '+$85,000' },
    { id: 4, user: 'Liam M.', action: 'added Captain Rex Phase 2 #sw0450', time: '1m ago', val: '+$298' },
  ]);

  // Perpetual live feed generator that updates continuously in perpetuity
  useEffect(() => {
    let counter = 5;
    const interval = setInterval(() => {
      const randomEvent = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      setPulses(prev => [
        { id: counter++, user: randomEvent.user, action: randomEvent.action, time: 'Just now', val: randomEvent.val },
        ...prev.slice(0, 4).map((p, idx) => ({ ...p, time: `${(idx + 1) * 18}s ago` }))
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const totalVaultSum = useMemo(() => {
    return COMMUNITY_MEMBERS.reduce((acc, m) => acc + m.vaultValue, 0);
  }, []);

  const totalItemsSum = useMemo(() => {
    return COMMUNITY_MEMBERS.reduce((acc, m) => acc + m.itemCount, 0);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] font-sans text-gray-900 overflow-y-auto pb-32 select-none">
      
      {/* ─── Header ─── */}
      <div className="px-5 pt-[max(env(safe-area-inset-top),2.5rem)] pb-3 sticky top-0 bg-[#F5F5F7]/90 backdrop-blur-xl z-20 border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase flex items-center gap-1">
              <Users className="w-3 h-3" />
              COMMUNITY VAULTS
            </span>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Collector Network</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-black">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>1,420 Active</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5 mt-4">
        
        {/* ─── Community Total Metrics Banner ─── */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Total Network Vault Value
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +6.8% 30D
              </span>
            </div>

            <div className="text-3xl font-black tracking-tight text-white mb-4">
              ${totalVaultSum.toLocaleString()}<span className="text-gray-400 text-lg font-bold">.00</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block">Assets Tracked</span>
                <span className="text-sm font-black text-white">{totalItemsSum.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block">Average Vault</span>
                <span className="text-sm font-black text-emerald-400">${Math.round(totalVaultSum / COMMUNITY_MEMBERS.length).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block">24h Activity</span>
                <span className="text-sm font-black text-white">+84 Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Perpetual Live Community Pulses (Continuous Stream) ─── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Live Vault Activity Stream
            </h3>
            <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LIVE
            </span>
          </div>

          <div className="space-y-2">
            {pulses.map((pulse) => (
              <div key={pulse.id} className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-sm flex items-center justify-between transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      <span className="font-extrabold">{pulse.user}</span> {pulse.action}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">{pulse.time}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 shrink-0 ml-2">{pulse.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Collector Showcase (Figurine Avatars Only, Non-clickable) ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                Featured Collector Vaults
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Verified community inventories</p>
            </div>
          </div>

          <div className="space-y-3">
            {COMMUNITY_MEMBERS.map((member, idx) => (
              <div 
                key={member.id}
                className="bg-white rounded-3xl p-4 border border-gray-200/90 shadow-sm transition-all"
              >
                {/* Member Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* ONLY FIGURINE IMAGE */}
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-gray-200 shadow-sm p-1 flex items-center justify-center overflow-hidden">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-black flex items-center justify-center border border-white">
                        #{idx + 1}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-gray-900">{member.name}</h4>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{member.handle}</span>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${member.badgeColor}`}>
                    {member.badge}
                  </span>
                </div>

                {/* Collection Summary Pill & Focus */}
                <div className="bg-[#F5F5F7] rounded-2xl p-3 mb-3 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Focus</span>
                    <p className="text-xs font-bold text-gray-800 truncate">{member.featuredCategory}</p>
                    <span className="text-[10px] text-gray-500 font-medium truncate block">{member.collectionSummary}</span>
                  </div>

                  {/* Top Asset Preview Mini-Thumb */}
                  <div className="w-12 h-12 bg-white rounded-xl p-1 border border-gray-200 shrink-0 flex items-center justify-center shadow-xs">
                    <img 
                      src={member.topAssetImg} 
                      alt={member.topAsset} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                {/* Value Row */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400">Vault Total:</span>
                    <span className="text-sm font-black text-emerald-600">${member.vaultValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <span className="text-gray-400">{member.itemCount} collectibles</span>
                    <span className="text-emerald-600 font-black">({member.gain30D})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
