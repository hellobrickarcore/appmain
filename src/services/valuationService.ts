import { Brick } from '../types';

/**
 * Service responsible for determining the market value of LEGO items.
 * In a full production environment, this would integrate with the BrickLink or Rebrickable API.
 * For now, it provides an intelligent estimation model based on part characteristics.
 */
const valuationCache = new Map<string, number>();

export const valuationService = {
  
  async estimateItemValue(brick: Brick): Promise<number> {
    const cacheKey = brick.partNumber || brick.id;
    if (valuationCache.has(cacheKey)) {
        return valuationCache.get(cacheKey)!;
    }
    if (brick.estimatedValueUsd !== undefined) {
        valuationCache.set(cacheKey, brick.estimatedValueUsd);
        return brick.estimatedValueUsd;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 50)); // Faster for testing
    } catch (e) {
      console.warn("API Error simulated", e);
    }

    let baseValue = 0.05;

    if (brick.itemType === 'minifigure' || brick.name.toLowerCase().includes('minifigure')) {
      baseValue = 4.50;
      const rareKeywords = ['star wars', 'jedi', 'sith', 'castle', 'knight', 'chrome', 'gold', 'vintage'];
      if (rareKeywords.some(kw => brick.name.toLowerCase().includes(kw))) {
        baseValue += (Math.random() * 15) + 5;
      }
    } 
    else if (brick.itemType === 'set') {
      baseValue = 25.00;
    }
    else {
      const rareColors = ['Gold', 'Chrome', 'Trans-Clear', 'Sand Green'];
      if (rareColors.includes(brick.color || '')) {
        baseValue += 0.50;
      }
      if (brick.category === 'Minifigure Parts' || brick.category === 'Accessories') {
        baseValue += 0.75;
      } else if (brick.category === 'Technic') {
        baseValue += 0.15;
      } else if (brick.category === 'Plants' || brick.category === 'Animals') {
        baseValue += 0.40;
      }
    }

    const finalValue = Math.round(baseValue * (1 + (Math.random() * 0.1 - 0.05)) * 100) / 100;
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
          const count = b.count || 0;
          const unitValue = await this.estimateItemValue(b);
          return (unitValue || 0) * count;
        } catch (e) {
           return 0; // Fallback
        }
      }));
      total += values.reduce((sum, val) => sum + val, 0);
    }
    
    return Math.round(total * 100) / 100;
  }
};
