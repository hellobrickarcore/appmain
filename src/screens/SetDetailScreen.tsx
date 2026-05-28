import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Info, ChevronRight, Lock } from 'lucide-react';
import { Screen, LegoSetModel } from '../types';
import { mockSets, mockValuations, mockMinifigs } from '../lib/mock-data';

interface SetDetailScreenProps {
  onNavigate: (screen: Screen, params?: any) => void;
  setNum?: string;
}

export const SetDetailScreen: React.FC<SetDetailScreenProps> = ({ onNavigate, setNum }) => {
  // Fallback to Lion Knights' Castle to match the screenshot perfectly if no setNum
  const activeSetNum = setNum || '10305-1';
  
  const isMinifig = activeSetNum.startsWith('fig') || 
                    activeSetNum.startsWith('sp') || 
                    activeSetNum.startsWith('inf') || 
                    activeSetNum.startsWith('njo');
  
  const set = mockSets.find(s => s.setNum === activeSetNum) || 
              mockMinifigs.find(f => f.figNum === activeSetNum) || 
              {
                id: "set-default",
                name: "Lion Knights' Castle",
                setNum: "10305-1",
                retailPrice: 399.99,
                imageUrl: 'https://cdn.rebrickable.com/media/sets/10305-1.jpg',
                isRetired: false,
                type: 'set'
              };

  const mockVal = mockValuations.get(activeSetNum);
  const val = mockVal || (
    isMinifig 
      ? {
          sealedValue: (set as any).resaleValue || 45.00,
          usedValue: (set as any).resaleValue || 45.00,
          resaleAvg: (set as any).resaleValue || 45.00,
          sealedChange30d: 5.2,
          usedChange30d: 5.2,
          rarityScore: (set as any).rarityScore || 7,
          demandScore: (set as any).rarityScore || 7,
          isRetired: true,
          priceHistory: []
        }
      : {
          sealedValue: 450.00,
          usedValue: 399.99,
          resaleAvg: 410.00,
          sealedChange30d: 4.2,
          usedChange30d: 2.1,
          rarityScore: 9.8,
          demandScore: 9,
          isRetired: false,
          priceHistory: []
        }
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] font-sans text-slate-900 overflow-hidden select-none">
      
      {/* Header */}
      <div className="px-6 pt-[max(env(safe-area-inset-top),3rem)] pb-4 flex items-center justify-between bg-white border-b border-slate-100 z-10 shrink-0">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="w-10 h-10 flex items-center justify-center -ml-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <div className="text-center flex-1 mx-4">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-widest">{set.setNum}</span>
          <h1 className="text-base font-black text-slate-900 truncate leading-tight">{set.name}</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center -mr-2 active:scale-95 transition-transform">
          <Share2 className="w-5 h-5 text-slate-900" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* Hero Image */}
        <div className="w-full bg-white px-6 py-8 flex items-center justify-center border-b border-slate-100 shadow-sm relative">
          <img 
            src={set.imageUrl || `https://cdn.rebrickable.com/media/sets/${set.setNum}.jpg`} 
            alt={set.name}
            onError={(e) => {
              e.currentTarget.src = `https://cdn.rebrickable.com/media/sets/${set.setNum}-1.jpg`;
            }}
            className="w-[240px] h-[180px] object-contain drop-shadow-xl"
          />
        </div>

        {/* Set Details Stats */}
        <div className="px-6 pt-6">
          <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-3">Set Details</h3>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Value</span>
              <span className="text-lg font-black text-[#1DA1F2]">${(set.retailPrice || 399.99).toFixed(2)}</span>
            </div>
            <div className="w-px h-10 bg-slate-100 mx-2" />
            <div className="text-center flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Items</span>
              <span className="text-lg font-black text-slate-900">1</span>
            </div>
            <div className="w-px h-10 bg-slate-100 mx-2" />
            <div className="text-center flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unique</span>
              <span className="text-lg font-black text-slate-900">1</span>
            </div>
          </div>
        </div>

        {/* Rarity & Condition Grid */}
        <div className="px-6 pt-4 flex gap-4">
          
          {/* Rarity Score */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-[0.4] flex flex-col items-center justify-center relative">
            <div className="absolute top-3 right-3">
              <Info className="w-4 h-4 text-slate-300" />
            </div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Rarity Score</h3>
            
            {/* Circular Progress Mock */}
            <div className="w-20 h-20 relative flex items-center justify-center mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500"
                  strokeWidth="3"
                  strokeDasharray="98, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xl font-black text-slate-900">9.8</span>
            </div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">SCARCE</span>
          </div>

          {/* Value Breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-[0.6] flex flex-col justify-center">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Value Breakdown</h3>
            
            <div className="space-y-4">
              {/* Condition */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <span className="text-slate-400">Condition</span>
                  <span className="text-slate-900">Used, Opened</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-[#1DA1F2] h-1.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              {/* Box */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <span className="text-slate-400">Box</span>
                  <span className="text-slate-900">Minor Wear</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-[#1DA1F2] h-1.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              {/* Instructions */}
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <span className="text-slate-400">Instructions</span>
                  <span className="text-slate-900">Included</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-[#1DA1F2] h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex gap-3">
        <button
          className="flex-1 h-14 bg-[#FF7A30] text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#FF7A30]/30"
        >
          <Lock className="w-4 h-4" />
          View Full Report
        </button>
      </div>

    </div>
  );
};

