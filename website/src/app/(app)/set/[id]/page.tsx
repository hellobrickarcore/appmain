"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Heart,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Tag,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  CheckCircle,
  HelpCircle,
  X
} from "lucide-react";
import { getSetByNum, getValuation, mockSets } from "@/lib/mock-data";
import { fetchRebrickableSetDetails } from "@/lib/rebrickable";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { Badge, Card, RarityMeter, ValueDisplay, PriceChange } from "@/components/ui";
import type { LegoSet, SetValuation, CollectionItem, WishlistItem } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export default function SetDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const setNum = decodeURIComponent(id);

  const [set, setSet] = useState<LegoSet | null>(null);
  const [val, setVal] = useState<SetValuation | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [inCollection, setInCollection] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Dialog States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  
  // Form States
  const [condition, setCondition] = useState<"sealed" | "used" | "partial">("sealed");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    async function loadSetDetails() {
      // 1. Try local mock database
      const foundSet = getSetByNum(setNum);
      const foundVal = getValuation(setNum);

      if (foundSet) {
        setSet(foundSet);
        setVal(foundVal || null);
        setLoading(false);
      } else {
        // 2. Fallback: Fetch details from live Rebrickable API
        try {
          const liveData = await fetchRebrickableSetDetails(setNum);
          if (liveData) {
            setSet(liveData.set);
            setVal(liveData.valuation);
          }
        } catch (err) {
          console.error("Error fetching live set details:", err);
        } finally {
          setLoading(false);
        }
      }
    }

    loadSetDetails();

    // Initialize State from LocalStorage or mock data
    if (typeof window !== "undefined") {
      const storedCollection = localStorage.getItem("hb_collection");
      const storedWishlist = localStorage.getItem("hb_wishlist");

      let currentCollection: CollectionItem[] = [];
      let currentWishlist: WishlistItem[] = [];

      if (storedCollection) {
        currentCollection = JSON.parse(storedCollection);
      } else {
        // Fallback to import mock data in localstorage for consistency
        const { mockCollection: mockCol } = require("@/lib/mock-data");
        currentCollection = mockCol;
        localStorage.setItem("hb_collection", JSON.stringify(mockCol));
      }

      if (storedWishlist) {
        currentWishlist = JSON.parse(storedWishlist);
      } else {
        const { mockWishlist: mockWish } = require("@/lib/mock-data");
        currentWishlist = mockWish;
        localStorage.setItem("hb_wishlist", JSON.stringify(mockWish));
      }

      setCollectionItems(currentCollection);
      setWishlistItems(currentWishlist);

      // Check if this set is already in collection or wishlist
      const isCol = currentCollection.some((item) => item.setNum === setNum);
      const isWish = currentWishlist.some((item) => item.setNum === setNum);
      setInCollection(isCol);
      setInWishlist(isWish);
    }
  }, [setNum]);

  // Show auto-dismissing toast
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add Set to Collection
  const handleAddToCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!set) return;

    const newItem: CollectionItem = {
      id: `col_${Date.now()}`,
      userId: "user_mvp",
      setNum: set.setNum,
      condition,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : set.retailPrice,
      purchaseDate: purchaseDate || null,
      addedAt: new Date().toISOString(),
      notes,
    };

    const updated = [newItem, ...collectionItems];
    setCollectionItems(updated);
    localStorage.setItem("hb_collection", JSON.stringify(updated));
    setInCollection(true);
    setShowAddModal(false);
    showToast(`Added ${set.name} to Collection!`, "success");
    
    // Reset form
    setPurchasePrice("");
    setNotes("");
  };

  // Quick Remove from Collection
  const handleRemoveFromCollection = () => {
    if (!set) return;
    const updated = collectionItems.filter((item) => item.setNum !== set.setNum);
    setCollectionItems(updated);
    localStorage.setItem("hb_collection", JSON.stringify(updated));
    setInCollection(false);
    showToast("Removed from your Collection.", "info");
  };

  // Add / Remove from Wishlist
  const handleToggleWishlist = () => {
    if (!set) return;

    if (inWishlist) {
      // Remove
      const updated = wishlistItems.filter((item) => item.setNum !== set.setNum);
      setWishlistItems(updated);
      localStorage.setItem("hb_wishlist", JSON.stringify(updated));
      setInWishlist(false);
      showToast("Removed from Wishlist.", "info");
    } else {
      // Open target price modal
      setTargetPrice(set.retailPrice ? set.retailPrice.toString() : "");
      setShowWishlistModal(true);
    }
  };

  const handleSaveWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!set) return;

    const newItem: WishlistItem = {
      id: `wish_${Date.now()}`,
      userId: "user_mvp",
      setNum: set.setNum,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      addedAt: new Date().toISOString(),
    };

    const updated = [newItem, ...wishlistItems];
    setWishlistItems(updated);
    localStorage.setItem("hb_wishlist", JSON.stringify(updated));
    setInWishlist(true);
    setShowWishlistModal(false);
    showToast(`Added ${set.name} to Wishlist!`, "success");
  };

  // Get Related Sets (same theme)
  const relatedSets = mockSets
    .filter((s) => s.theme === set?.theme && s.setNum !== set?.setNum)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={48} className="text-[#FFCE4A] animate-spin" />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h1 className="font-display font-bold text-3xl text-[#050A18] mb-3">
          Set Not Found
        </h1>
        <p className="text-gray-500 text-lg max-w-md mb-8">
          The LEGO set with identifier &ldquo;{setNum}&rdquo; could not be found in our database.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-[#050A18] hover:bg-gray-50 hover:border-gray-300 transition-all font-bold shadow-sm"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-20 px-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#050A18] hover:border-gray-300 transition-colors font-bold shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm font-mono font-bold">
           <span className="text-gray-400 text-sm">SET ID</span>
           <span className="text-[#FF7A30] text-lg">{set.setNum}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Visuals & Core Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl border border-gray-100 bg-white p-8 md:p-12 shadow-sm group overflow-hidden"
          >
            {/* Background decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[#FFCE4A]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#FFCE4A]/10 transition-colors duration-500" />
            
            <div className="aspect-square w-full relative flex items-center justify-center">
              <img
                src={set.imageUrl}
                alt={set.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-500 z-10"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                  const label = document.getElementById("img-fallback");
                  if (label) label.classList.remove("hidden");
                }}
              />
              <div
                id="img-fallback"
                className="hidden absolute inset-0 flex flex-col items-center justify-center text-gray-300 z-20"
              >
                <Layers size={64} className="mb-4" />
                <span className="text-lg font-bold font-mono text-gray-400">
                  IMAGE UNAVAILABLE
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {inCollection ? (
              <div className="flex-1 flex gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white border border-gray-200 text-[#050A18] font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Plus size={18} />
                  Add Another
                </button>
                <button
                  onClick={handleRemoveFromCollection}
                  className="px-6 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 hover:bg-red-100 transition-all shadow-sm"
                  title="Remove from Collection"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-[#050A18] text-white text-lg font-bold hover:bg-[#FF7A30] transition-all shadow-sm"
              >
                <Plus size={20} />
                Add to Collection
              </button>
            )}
            <button
              onClick={handleToggleWishlist}
              className={`flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold shadow-sm transition-all border ${
                inWishlist
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <Heart size={20} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
              {inWishlist ? "Wishlisted" : "Wishlist"}
            </button>
          </motion.div>
        </div>

        {/* Right Column: Details & Market Data */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Identity Header */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">{set.theme}</span>
              {set.isRetired ? (
                <span className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">Retired</span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">Active</span>
              )}
              {val && val.sealedChange7d > 2 && (
                <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={12} /> Rising
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-4xl lg:text-5xl text-[#050A18] leading-tight">
              {set.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-500 font-medium pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1.5"><Calendar size={16}/> Released {set.year}</span>
              <span className="hidden sm:block text-gray-300">•</span>
              <span className="flex items-center gap-1.5"><Layers size={16}/> {set.numParts} Parts</span>
              {set.retailPrice && (
                <>
                  <span className="hidden sm:block text-gray-300">•</span>
                  <span className="flex items-center gap-1.5"><Tag size={16}/> Retail {formatCurrency(set.retailPrice)}</span>
                </>
              )}
            </div>
          </motion.div>

          {/* Market Values */}
          {val && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Sealed Valuation */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCE4A]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FFCE4A]/20 transition-colors" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  New / Sealed Value
                </span>
                <div className="font-display text-4xl font-bold text-[#050A18] mb-4">
                  {formatCurrency(val.sealedValue)}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-medium text-gray-500">7-Day Trend</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
                      val.sealedChange7d >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {val.sealedChange7d >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                    {formatPercent(val.sealedChange7d)}
                  </span>
                </div>
              </div>

              {/* Used Valuation */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Used / Complete Value
                </span>
                <div className="font-display text-4xl font-bold text-[#050A18] mb-4">
                   {formatCurrency(val.usedValue)}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm font-medium text-gray-500">7-Day Trend</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
                      val.usedChange7d >= 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                     {val.usedChange7d >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                    {formatPercent(val.usedChange7d)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Detailed Analytics */}
          {val && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100"
            >
              {/* Rarity */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award size={20} className="text-[#FF7A30]" />
                  <h3 className="font-bold text-lg text-[#050A18]">Rarity Rating</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>{val.rarityScore <= 3 ? "Common" : val.rarityScore <= 6 ? "Uncommon" : val.rarityScore <= 8 ? "Rare" : "Very Rare"}</span>
                    <span className="text-[#050A18] font-mono">{val.rarityScore}/10</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < val.rarityScore
                            ? i < 3 ? "bg-blue-400" : i < 6 ? "bg-green-400" : i < 8 ? "bg-purple-400" : "bg-[#FF7A30]"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Demand */}
              <div>
                 <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-[#FFCE4A]" />
                  <h3 className="font-bold text-lg text-[#050A18]">Demand Velocity</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <span>Market Interest</span>
                    <span className="text-[#050A18] font-mono">{val.demandScore}/10</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val.demandScore * 10}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#FFCE4A] to-[#FF7A30]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Price History Chart */}
          {val && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
            >
              <h3 className="font-bold text-xl text-[#050A18] mb-6 border-b border-gray-100 pb-4">Market History</h3>
              <PriceHistoryChart priceHistory={val.priceHistory} basePrice={set.retailPrice || undefined} />
            </motion.div>
          )}

          {/* Related / Comparable Assets */}
          {relatedSets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
            >
              <h3 className="font-bold text-xl text-[#050A18] mb-6">
                Comparable {set.theme} Sets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedSets.map((rSet) => {
                  const rVal = getValuation(rSet.setNum);
                  return (
                    <Link
                      key={rSet.setNum}
                      href={`/set/${rSet.setNum}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-1.5 flex-shrink-0 group-hover:border-[#FFCE4A] transition-colors">
                        <img src={rSet.imageUrl} alt={rSet.name} className="h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#050A18] truncate group-hover:text-[#FF7A30] transition-colors">
                          {rSet.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-1 font-bold">
                          {rSet.setNum}
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="font-display font-bold text-[#050A18]">
                          {rVal ? formatCurrency(rVal.sealedValue) : "—"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-10 right-10 z-50 flex justify-end pointer-events-none"
          >
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 pointer-events-auto">
              {toast.type === "success" ? (
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              ) : (
                <Sparkles size={20} className="text-[#FF7A30] flex-shrink-0" />
              )}
              <span className="text-sm font-bold text-[#050A18]">
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          Add to Collection Modal
          ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#050A18]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#050A18]">
                    Add to Collection
                  </h3>
                  <p className="text-gray-500 font-medium mt-1">
                    Track the valuation and purchase return of this asset.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                   className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddToCollection} className="space-y-6 text-left">
                {/* Condition selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Set Condition
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: "sealed", label: "Sealed", desc: "Mint in box" },
                      { value: "used", label: "Used", desc: "100% complete" },
                      { value: "partial", label: "Partial", desc: "Missing parts" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCondition(opt.value as any)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                          condition === opt.value
                            ? "bg-[#FFCE4A]/20 border-[#FFCE4A] text-[#050A18]"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-sm font-bold block">{opt.label}</span>
                        <span className="text-[10px] mt-1 block font-medium">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Purchase Price</span>
                    {set.retailPrice && (
                      <button
                        type="button"
                        onClick={() => setPurchasePrice(set.retailPrice?.toString() || "")}
                        className="text-[#FF7A30] hover:underline normal-case font-bold"
                      >
                        Use retail (${set.retailPrice})
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder={set.retailPrice ? set.retailPrice.toString() : "0.00"}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-[#050A18] text-lg font-bold focus:outline-none focus:border-[#FF7A30]/50 focus:ring-4 focus:ring-[#FF7A30]/10 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Purchase Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Purchase Date
                  </label>
                  <div className="relative">
                    <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-[#050A18] font-bold focus:outline-none focus:border-[#FF7A30]/50 focus:ring-4 focus:ring-[#FF7A30]/10 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Collector Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Bought at local garage sale, box slightly damaged."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[#050A18] font-medium focus:outline-none focus:border-[#FF7A30]/50 focus:ring-4 focus:ring-[#FF7A30]/10 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-4 rounded-xl bg-[#FF7A30] text-white text-lg font-bold hover:bg-[#E66620] shadow-sm shadow-[#FF7A30]/20 transition-all mt-4"
                >
                  Save to Collection
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          Add to Wishlist target price Modal
          ========================================================================= */}
      <AnimatePresence>
        {showWishlistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWishlistModal(false)}
              className="absolute inset-0 bg-[#050A18]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl z-10"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#050A18]">
                    Monitor Set
                  </h3>
                  <p className="text-gray-500 font-medium text-sm mt-1">
                    Set a target price alert.
                  </p>
                </div>
                <button
                  onClick={() => setShowWishlistModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveWishlist} className="space-y-6 text-left">
                {/* Target Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Alert Target Price (USD)
                  </label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={set.retailPrice ? set.retailPrice.toString() : "0.00"}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[#050A18] text-lg font-bold focus:outline-none focus:border-[#FF7A30]/50 focus:ring-4 focus:ring-[#FF7A30]/10 focus:bg-white transition-all font-mono"
                      autoFocus
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 block">
                    Current Sealed Value: <span className="font-bold text-[#050A18]">{val ? formatCurrency(val.sealedValue) : "—"}</span>
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWishlistModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#050A18] text-white font-bold hover:bg-[#FF7A30] shadow-sm transition-all"
                  >
                    Set Alert
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple dynamic spinner helper
function Loader2({ size = 20, className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
