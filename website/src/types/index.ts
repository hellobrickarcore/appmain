// ─── HelloBrick Types ───────────────────────────────────────────────────────

export interface LegoSet {
  id: string;
  setNum: string;           // e.g. '10270-1'
  name: string;             // e.g. 'Bookshop'
  year: number;
  theme: string;
  themeId: number;
  numParts: number;
  imageUrl: string;
  retailPrice: number | null;
  isRetired: boolean;
}

export interface SetValuation {
  setNum: string;
  sealedValue: number;
  usedValue: number;
  resaleAvg: number;
  sealedChange24h: number;  // percentage
  usedChange24h: number;
  sealedChange7d: number;
  usedChange7d: number;
  sealedChange30d: number;
  usedChange30d: number;
  rarityScore: number;      // 1-10
  demandScore: number;      // 1-10
  priceHistory: PricePoint[];
  lastUpdated: string;
}

export interface PricePoint {
  date: string;  // ISO date string
  sealed: number;
  used: number;
}

export interface CollectionItem {
  id: string;
  userId: string;
  setNum: string;
  condition: 'sealed' | 'used' | 'partial';
  purchasePrice: number | null;
  purchaseDate: string | null;
  addedAt: string;
  notes: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  setNum: string;
  targetPrice: number | null;
  addedAt: string;
}

export interface PortfolioSummary {
  totalSets: number;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  change24h: number;
  change24hPercent: number;
  change7d: number;
  change7dPercent: number;
  change30d: number;
  change30dPercent: number;
  portfolioHistory: { date: string; value: number }[];
}

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'value' | 'name' | 'year' | 'gain' | 'added';
export type Condition = 'sealed' | 'used' | 'partial';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author?: string;
  image_url: string;
  seo_metadata: {
    keywords: string[];
    description: string;
  };
  status: 'draft' | 'published';
  created_at: string;
}
