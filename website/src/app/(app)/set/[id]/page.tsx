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
} from "lucide-react";
import { getSetByNum, getValuation, mockSets } from "@/lib/mock-data";
import { fetchRebrickableSetDetails } from "@/lib/rebrickable";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { Badge, Card, RarityMeter, ValueDisplay, PriceChange } from "@/components/ui";
import type { LegoSet, SetValuation, CollectionItem, WishlistItem } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
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
      <div className="min-h-screen bg-hb-bg flex items-center justify-center">
        <Loader2 size={32} className="text-hb-gold animate-spin" />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-hb-bg flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-hb-negative mb-4" />
        <h1 className="font-outfit font-bold text-xl text-hb-primary mb-2">
          Set Not Found
        </h1>
        <p className="text-hb-secondary text-sm max-w-sm mb-6">
          The LEGO set with identifier &ldquo;{setNum}&rdquo; could not be found in our intelligence library.
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hb-surface border border-hb-border text-hb-primary hover:bg-hb-elevated transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  // Calculate some display percentages
  const displaySealedChange = val?.sealedChange7d ?? 0;
  const displayUsedChange = val?.usedChange7d ?? 0;

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto space-y-6 pb-24">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-hb-surface border border-hb-border flex items-center justify-center text-hb-secondary hover:text-hb-primary hover:border-hb-border-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-mono text-[10px] text-hb-tertiary tracking-widest font-semibold uppercase">
            HELLOBRICK INTEL
          </p>
          <p className="font-mono text-xs font-bold text-hb-gold">
            {set.setNum}
          </p>
        </div>
        <button
          onClick={handleToggleWishlist}
          className={cn(
            "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
            inWishlist
              ? "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171] scale-105"
              : "bg-hb-surface border-hb-border text-hb-secondary hover:text-hb-primary hover:border-hb-border-hover"
          )}
        >
          <Heart size={18} className={inWishlist ? "fill-[#F87171]" : ""} />
        </button>
      </div>

      {/* Hero Visual Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-hb-border bg-hb-surface p-5 text-center group shadow-xl"
      >
        {/* Apple-wallet style background glow & radial mesh */}
        <div className="absolute inset-0 bg-gradient-to-b from-hb-elevated/40 to-transparent pointer-events-none" />
        <div className="absolute top-[-50px] left-[50%] -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.05] blur-[80px] pointer-events-none" />

        {/* Set Image Container */}
        <div className="relative aspect-video w-full rounded-2xl bg-hb-bg/60 border border-hb-border/50 flex items-center justify-center overflow-hidden mb-5">
          {/* Subtle logo background mark */}
          <span className="absolute inset-0 flex items-center justify-center font-outfit text-hb-border/15 font-black text-6xl select-none uppercase tracking-widest">
            {set.theme.split(" ")[0]}
          </span>
          <img
            src={set.imageUrl}
            alt={set.name}
            className="h-32 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500 z-10"
            onError={(e) => {
              // Fail-safe placeholder if rebrickable image blocks us
              (e.target as HTMLElement).style.display = "none";
              const label = document.getElementById("img-fallback");
              if (label) label.classList.remove("hidden");
            }}
          />
          <div
            id="img-fallback"
            className="hidden absolute inset-0 flex flex-col items-center justify-center bg-hb-elevated text-hb-tertiary p-4 z-20"
          >
            <Layers size={24} className="mb-1 text-hb-gold/40 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider font-mono">
              {set.setNum}
            </span>
          </div>
        </div>

        {/* Identity Details */}
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap justify-center gap-1.5">
            <Badge variant="theme">{set.theme}</Badge>
            {set.isRetired ? (
              <Badge variant="retired">Retired</Badge>
            ) : (
              <Badge variant="new">Active Set</Badge>
            )}
            {val && val.sealedChange7d > 2 && (
              <Badge variant="rising">Rising 🔥</Badge>
            )}
          </div>

          <h1 className="font-outfit font-bold text-xl sm:text-2xl text-hb-primary leading-snug max-w-md mx-auto">
            {set.name}
          </h1>

          <div className="flex items-center justify-center gap-3 text-hb-tertiary text-xs">
            <span>Released {set.year}</span>
            <span>·</span>
            <span>{set.numParts} Parts</span>
            {set.retailPrice && (
              <>
                <span>·</span>
                <span>Retail ${set.retailPrice}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Asset Valuations */}
      {val && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Sealed Valuation */}
          <Card className="flex flex-col justify-between p-4 bg-hb-surface hover:border-hb-border-hover relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-hb-gold/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <span className="text-[10px] font-semibold text-hb-gold uppercase tracking-wider block mb-1">
                Sealed Value
              </span>
              <ValueDisplay
                value={val.sealedValue}
                size="md"
                className="font-mono text-hb-primary font-bold text-xl"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-hb-border/30 pt-2">
              <span className="text-[10px] text-hb-tertiary">7D change</span>
              <PriceChange value={val.sealedChange7d} size="sm" />
            </div>
          </Card>

          {/* Used Valuation */}
          <Card className="flex flex-col justify-between p-4 bg-hb-surface hover:border-hb-border-hover">
            <div>
              <span className="text-[10px] font-semibold text-hb-secondary uppercase tracking-wider block mb-1">
                Used Value
              </span>
              <ValueDisplay
                value={val.usedValue}
                size="md"
                className="font-mono text-hb-primary font-bold text-xl"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-hb-border/30 pt-2">
              <span className="text-[10px] text-hb-tertiary">7D change</span>
              <PriceChange value={val.usedChange7d} size="sm" />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        {inCollection ? (
          <div className="w-full flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-hb-surface border border-hb-border text-hb-primary text-[14px] font-semibold hover:bg-hb-elevated transition-all"
            >
              <Plus size={16} />
              Add Another (Owned)
            </button>
            <button
              onClick={handleRemoveFromCollection}
              className="w-12 rounded-2xl bg-[#F87171]/10 border border-[#F87171]/20 flex items-center justify-center text-[#F87171] hover:bg-[#F87171]/20 transition-all"
              title="Remove All from Collection"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl gradient-gold text-[#0C0F14] text-[14px] font-bold hover:brightness-110 active:scale-98 transition-all shadow-md shadow-hb-gold/10"
          >
            <Plus size={16} />
            Add to Collection
          </button>
        )}
      </motion.div>

      {/* Rarity and Demand Scorings */}
      {val && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <Card className="p-4 space-y-4 bg-hb-surface/50">
            <div className="flex items-center gap-2 mb-1">
              <Award size={16} className="text-hb-gold" />
              <h3 className="font-outfit font-semibold text-[13px] text-hb-primary uppercase tracking-wider">
                Investment Metrics
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[11px] text-hb-secondary block font-medium">Rarity Rating</span>
                <RarityMeter score={val.rarityScore} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-hb-secondary">
                  <span>Demand Velocity</span>
                  <span className="font-mono text-hb-primary font-semibold">{val.demandScore}/10</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-hb-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val.demandScore * 10}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-hb-navy to-hb-info"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Price History Chart */}
      {val && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PriceHistoryChart priceHistory={val.priceHistory} basePrice={set.retailPrice || undefined} />
        </motion.div>
      )}

      {/* Related / Comparable Assets */}
      {relatedSets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <h3 className="font-outfit font-semibold text-[14px] text-hb-primary">
            Comparable Sets ({set.theme})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {relatedSets.map((rSet) => {
              const rVal = getValuation(rSet.setNum);
              return (
                <Link
                  key={rSet.setNum}
                  href={`/set/${rSet.setNum}`}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-hb-border bg-hb-surface hover:bg-hb-elevated hover:border-hb-border-hover transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-hb-bg border border-hb-border flex items-center justify-center flex-shrink-0 font-mono text-[8px] text-hb-tertiary">
                    {rSet.setNum.split("-")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-hb-primary truncate leading-tight">
                      {rSet.name}
                    </p>
                    <p className="text-[10px] text-hb-secondary font-mono mt-0.5">
                      {rVal ? formatCurrency(rVal.sealedValue) : "—"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="glass-elevated border border-hb-border rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-2.5 pointer-events-auto">
              {toast.type === "success" ? (
                <CheckCircle size={18} className="text-hb-positive flex-shrink-0" />
              ) : (
                <Sparkles size={18} className="text-hb-gold flex-shrink-0" />
              )}
              <span className="text-[13px] font-medium text-hb-primary">
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          Add to Collection Drawer Modal
          ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-hb-bg/85 backdrop-blur-sm"
            />
            {/* Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-hb-surface border-t border-hb-border rounded-t-3xl p-6 space-y-5 overflow-y-auto max-h-[85vh] z-10 thin-scrollbar"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-hb-border rounded-full mx-auto -mt-2 mb-4" />
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-outfit font-bold text-lg text-hb-primary">
                    Add Set to Collection
                  </h3>
                  <p className="text-hb-secondary text-xs mt-0.5">
                    Track the valuation and purchase return of this asset.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-hb-elevated flex items-center justify-center text-hb-secondary hover:text-hb-primary"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddToCollection} className="space-y-4 text-left">
                {/* Condition selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Set Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "sealed", label: "Sealed (New)", desc: "In mint original box" },
                      { value: "used", label: "Used (Complete)", desc: "Opened but 100% parts" },
                      { value: "partial", label: "Partial / No Box", desc: "Missing parts or no box" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCondition(opt.value as any)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center",
                          condition === opt.value
                            ? "bg-hb-gold/10 border-hb-gold text-hb-primary"
                            : "bg-hb-bg/50 border-hb-border text-hb-secondary hover:border-hb-border-hover"
                        )}
                      >
                        <span className="text-[12px] font-bold block">{opt.label}</span>
                        <span className="text-[9px] mt-0.5 block leading-tight opacity-75">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider flex items-center justify-between">
                    <span>Purchase Price</span>
                    {set.retailPrice && (
                      <button
                        type="button"
                        onClick={() => setPurchasePrice(set.retailPrice?.toString() || "")}
                        className="text-hb-gold hover:underline capitalize font-normal text-[10px]"
                      >
                        Use retail (${set.retailPrice})
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hb-tertiary" />
                    <input
                      type="number"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder={set.retailPrice ? set.retailPrice.toString() : "0.00"}
                      className="w-full bg-hb-bg border border-hb-border rounded-xl pl-9 pr-4 py-2.5 text-hb-primary text-sm focus:outline-none focus:border-hb-gold/40 focus:ring-1 focus:ring-hb-gold/20 font-mono"
                    />
                  </div>
                </div>

                {/* Purchase Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Purchase Date
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hb-tertiary" />
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-hb-bg border border-hb-border rounded-xl pl-9 pr-4 py-2.5 text-hb-primary text-sm focus:outline-none focus:border-hb-gold/40 focus:ring-1 focus:ring-hb-gold/20"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Collector Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Bought at local garage sale, box slightly damaged."
                    className="w-full bg-hb-bg border border-hb-border rounded-xl px-4 py-2.5 text-hb-primary text-sm focus:outline-none focus:border-hb-gold/40 focus:ring-1 focus:ring-hb-gold/20 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3.5 rounded-2xl gradient-gold text-[#0C0F14] text-[14px] font-bold hover:brightness-110 active:scale-98 transition-all shadow-md shadow-hb-gold/10 pt-3"
                >
                  Save Asset Details
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWishlistModal(false)}
              className="absolute inset-0 bg-hb-bg/85 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-hb-surface border border-hb-border rounded-3xl p-5 space-y-4 z-10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-outfit font-bold text-[16px] text-hb-primary">
                    Monitor Set Valuation
                  </h3>
                  <p className="text-hb-secondary text-[11px] mt-0.5">
                    We will track market prices and alert you when targets are reached.
                  </p>
                </div>
                <button
                  onClick={() => setShowWishlistModal(false)}
                  className="w-6 h-6 rounded-full bg-hb-elevated flex items-center justify-center text-hb-secondary hover:text-hb-primary text-sm"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveWishlist} className="space-y-4 text-left">
                {/* Target Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-hb-secondary uppercase tracking-wider block">
                    Alert Target Price (USD)
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-hb-tertiary" />
                    <input
                      type="number"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={set.retailPrice ? set.retailPrice.toString() : "0.00"}
                      className="w-full bg-hb-bg border border-hb-border rounded-xl pl-8 pr-3 py-2 text-hb-primary text-sm focus:outline-none focus:border-hb-gold/40 focus:ring-1 focus:ring-hb-gold/20 font-mono"
                      autoFocus
                    />
                  </div>
                  <span className="text-[9px] text-hb-tertiary block mt-0.5">
                    Current Sealed Value: {val ? formatCurrency(val.sealedValue) : "—"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWishlistModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-hb-border bg-hb-bg text-hb-secondary font-medium text-xs hover:text-hb-primary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl gradient-gold text-[#0C0F14] font-bold text-xs hover:brightness-110 active:scale-98 transition-all shadow-md shadow-hb-gold/5"
                  >
                    Set Monitor Alert
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
