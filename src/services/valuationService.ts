import { Brick, CollectionItem } from '../types';
import { apiRequest } from './apiService';
import { CONFIG } from './configService';
import { legoDatabase } from '../lib/legoDatabase';

export interface PortfolioStats {
  totalValueNew: number;
  totalValueUsed: number;
  totalSets: number;
  roiPercentage: number;
  topMovers: any[];
}

/**
 * Service responsible for determining the market value of LEGO items.
 * Powered by HelloBrick's Deep Database and Valuation Engine.
 */
const valuationCache = new Map<string, number>();

export const valuationService = {
  
  async estimateItemValue(brick: Brick): Promise<number> {
    const cacheKey = brick.partNumber || brick.id || brick.name;
    if (valuationCache.has(cacheKey)) {
      return valuationCache.get(cacheKey)!;
    }
    if (brick.estimatedValueUsd !== undefined) {
      valuationCache.set(cacheKey, brick.estimatedValueUsd);
      return brick.estimatedValueUsd;
    }

    // Check database first
    const dbItem = legoDatabase.findById(brick.partNumber || brick.id || brick.name);
    if (dbItem) {
      const val = dbItem.sealedPrice;
      valuationCache.set(cacheKey, val);
      return val;
    }

    let baseValue = 0.08;

    if (brick.itemType === 'minifigure' || brick.name.toLowerCase().includes('minifigure')) {
      baseValue = 8.50;
      const rareKeywords = ['star wars', 'jedi', 'sith', 'boba', 'knight', 'chrome', 'gold', 'revan', 'sdcc'];
      if (rareKeywords.some(kw => brick.name.toLowerCase().includes(kw))) {
        baseValue += 45.00;
      }
    } 
    else if (brick.itemType === 'set') {
      baseValue = 89.99;
    }
    else {
      const rareColors = ['Gold', 'Chrome', 'Trans-Clear', 'Sand Green', 'Pearl Gold'];
      if (rareColors.includes(brick.color || '')) {
        baseValue += 0.85;
      }
      if (brick.category === 'Minifigure Parts' || brick.category === 'Accessories') {
        baseValue += 1.25;
      } else if (brick.category === 'Technic') {
        baseValue += 0.25;
      } else if (brick.category === 'Plants' || brick.category === 'Animals') {
        baseValue += 0.65;
      }
    }

    const finalValue = Math.round(baseValue * 100) / 100;
    valuationCache.set(cacheKey, finalValue);
    return finalValue;
  },

  async calculatePortfolioValue(bricks: Brick[]): Promise<number> {
    let total = 0;
    const chunkSize = 10;
    for (let i = 0; i < bricks.length; i += chunkSize) {
      const chunk = bricks.slice(i, i + chunkSize);
      const values = await Promise.all(chunk.map(async b => {
        try {
          const count = b.count || 1;
          const unitValue = await this.estimateItemValue(b);
          return (unitValue || 0) * count;
        } catch (e) {
          return 0;
        }
      }));
      total += values.reduce((sum, val) => sum + val, 0);
    }
    
    return Math.round(total * 100) / 100;
  },

  async getPortfolioValuation(): Promise<PortfolioStats> {
    try {
      const stored = localStorage.getItem('hellobrick_collection_sets');
      if (stored) {
        const parsed = JSON.parse(stored) as CollectionItem[];
        let totalNew = 0;
        let totalUsed = 0;
        let totalCost = 0;

        parsed.forEach(item => {
          const qty = item.quantity ?? 1;
          const dbItem = legoDatabase.findById(item.setNum);
          // CRITICAL: Always prefer the explicitly saved price (from scanner).
          // Only fall back to database if no saved price exists.
          const savedPrice = (item as any).currentPrice || item.purchasePrice;
          if (savedPrice) {
            totalNew += savedPrice * qty;
            totalUsed += Math.round(savedPrice * 0.75) * qty;
            totalCost += (item.purchasePrice || savedPrice) * qty;
          } else if (dbItem) {
            totalNew += dbItem.sealedPrice * qty;
            totalUsed += dbItem.usedPrice * qty;
            totalCost += (item.purchasePrice || dbItem.retailPrice || dbItem.sealedPrice * 0.8) * qty;
          } else {
            const price = 49.99;
            totalNew += price * qty;
            totalUsed += Math.round(price * 0.75) * qty;
            totalCost += price * qty;
          }
        });

        const activeValuation = totalNew;
        const dynamicRoi = totalCost > 0 ? Math.round(((activeValuation - totalCost) / totalCost) * 1000) / 10 : 0.0;

        const allItems = [...collectiblesDatabase.getAll()];
        const topMovers = allItems.sort((a, b) => (b.growth30D || 0) - (a.growth30D || 0)).slice(0, 3);

        return {
          totalValueNew: Math.round(totalNew * 100) / 100,
          totalValueUsed: Math.round(totalUsed * 100) / 100,
          totalSets: parsed.length,
          roiPercentage: dynamicRoi,
          topMovers: topMovers as any
        };
      }
    } catch (e) {}

    return {
      totalValueNew: 0.00,
      totalValueUsed: 0.00,
      totalSets: 0,
      roiPercentage: 0.00,
      topMovers: []
    };
  },

  async getCollectionItems(): Promise<CollectionItem[]> {
    const stored = localStorage.getItem('hellobrick_collection_sets');
    if (stored) {
      try {
        return JSON.parse(stored) as CollectionItem[];
      } catch (e) {}
    }
    return [] as CollectionItem[];
  }
};
