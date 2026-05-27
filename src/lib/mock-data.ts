import type {
  LegoSetModel as LegoSet,
  MinifigureModel as Minifigure,
  SetValuation,
  CollectionItem,
  WishlistItem,
  PricePoint
} from '../types';

export function generatePriceHistory(
  basePrice: number,
  months: number,
  trend: 'up' | 'down' | 'stable',
  volatility = 0.03
): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();
  const driftMap = { up: 0.02, down: -0.012, stable: 0.002 };
  const drift = driftMap[trend];
  let sealedPrice = basePrice;
  let usedRatio = 0.70;

  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);

    if (i < months) {
      const shockSeed = Math.sin(i * 9876.54) * 1000;
      const pseudoRandom = shockSeed - Math.floor(shockSeed);
      const monthlyReturn = drift + (pseudoRandom - 0.5) * volatility;
      sealedPrice *= (1 + monthlyReturn);
      usedRatio = Math.max(0.62, Math.min(0.76, usedRatio + (pseudoRandom - 0.5) * 0.008));
    }

    points.push({
      date: date.toISOString().split('T')[0],
      sealed: Math.round(sealedPrice * 100) / 100,
      used: Math.round(sealedPrice * usedRatio * 100) / 100,
    });
  }
  return points;
}

// Global Sets Catalog
export const mockSets: LegoSet[] = [
  {
    id: 'set-01',
    setNum: '10270-1',
    name: 'Bookshop (Modular Building)',
    year: 2020,
    theme: 'Creator Expert',
    pieces: 2504,
    minifigs: 5,
    imageUrl: 'https://cdn.rebrickable.com/media/sets/10270-1.jpg',
    retailPrice: 199.99,
    isRetired: true,
    type: 'set'
  },
  {
    id: 'set-02',
    setNum: '75192-1',
    name: 'Millennium Falcon (UCS)',
    year: 2017,
    theme: 'Star Wars',
    pieces: 7541,
    minifigs: 8,
    imageUrl: 'https://cdn.rebrickable.com/media/sets/75192-1.jpg',
    retailPrice: 849.99,
    isRetired: false,
    type: 'set'
  },
  {
    id: 'set-03',
    setNum: '75252-1',
    name: 'Imperial Star Destroyer (UCS)',
    year: 2019,
    theme: 'Star Wars',
    pieces: 4784,
    minifigs: 2,
    imageUrl: 'https://cdn.rebrickable.com/media/sets/75252-1.jpg',
    retailPrice: 699.99,
    isRetired: true,
    type: 'set'
  },
  {
    id: 'set-04',
    setNum: '71043-1',
    name: 'Hogwarts Castle',
    year: 2018,
    theme: 'Harry Potter',
    pieces: 6020,
    minifigs: 4,
    imageUrl: 'https://cdn.rebrickable.com/media/sets/71043-1.jpg',
    retailPrice: 469.99,
    isRetired: false,
    type: 'set'
  },
  {
    id: 'set-05',
    setNum: '21319-1',
    name: 'Central Perk (Friends)',
    year: 2019,
    theme: 'Ideas',
    pieces: 1070,
    minifigs: 7,
    imageUrl: 'https://cdn.rebrickable.com/media/sets/21319-1.jpg',
    retailPrice: 59.99,
    isRetired: true,
    type: 'set'
  }
];

// Global Minifigures Catalog (Wired to match Brickify recordings exactly!)
export const mockMinifigs: Minifigure[] = [
  {
    id: 'fig-01',
    figNum: 'sp124',
    name: 'Shuttle Astronaut',
    year: 2011,
    theme: 'City',
    imageUrl: 'https://cdn.rebrickable.com/media/sets/sp124-1.jpg',
    resaleValue: 74.91,
    rarityScore: 8
  },
  {
    id: 'fig-02',
    figNum: 'sp065',
    name: 'Shuttle Astronaut (NASA Space)',
    year: 1990,
    theme: 'City',
    imageUrl: 'https://cdn.rebrickable.com/media/sets/sp065-1.jpg',
    resaleValue: 71.65,
    rarityScore: 7
  },
  {
    id: 'fig-03',
    figNum: 'inf001',
    name: 'Infomaniac (LEGO Island)',
    year: 1997,
    theme: 'City',
    imageUrl: 'https://cdn.rebrickable.com/media/sets/inf001-1.jpg',
    resaleValue: 104.18,
    rarityScore: 9
  },
  {
    id: 'fig-04',
    figNum: 'njo0108',
    name: 'Lloyd DX (Ninjago)',
    year: 2014,
    theme: 'Ninjago',
    imageUrl: 'https://cdn.rebrickable.com/media/sets/njo0108-1.jpg',
    resaleValue: 541.84,
    rarityScore: 10
  },
  {
    id: 'fig-05',
    figNum: 'njo0186',
    name: 'Kai (Ninjago Red Dragon)',
    year: 2015,
    theme: 'Ninjago',
    imageUrl: 'https://cdn.rebrickable.com/media/sets/njo0186-1.jpg',
    resaleValue: 299.49,
    rarityScore: 8
  },
  {
    id: 'fig-06',
    figNum: 'njo0154',
    name: 'Lloyd Possessed (Gold Dragon)',
    year: 2015,
    theme: 'Ninjago',
    imageUrl: 'https://cdn.rebrickable.com/media/sets/njo0154-1.jpg',
    resaleValue: 262.33,
    rarityScore: 8
  }
];

// Seed Valuations Map
const valuationSeeds = [
  { setNum: '10270-1', sealedValue: 254.00, usedValue: 185.00, sealedChange24h: 1.2, usedChange24h: 0.8, sealedChange7d: 3.4, usedChange7d: 2.1, sealedChange30d: 8.7, usedChange30d: 5.2, rarityScore: 7, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '75192-1', sealedValue: 726.00, usedValue: 585.00, sealedChange24h: -0.1, usedChange24h: -0.3, sealedChange7d: -0.8, usedChange7d: -0.6, sealedChange30d: -2.1, usedChange30d: -1.5, rarityScore: 5, demandScore: 10, trend: 'stable', volatility: 0.02 },
  { setNum: '75252-1', sealedValue: 1371.00, usedValue: 799.00, sealedChange24h: 0.9, usedChange24h: 0.5, sealedChange7d: 2.7, usedChange7d: 1.8, sealedChange30d: 6.4, usedChange30d: 4.1, rarityScore: 8, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '71043-1', sealedValue: 424.00, usedValue: 310.00, sealedChange24h: -0.5, usedChange24h: -0.2, sealedChange7d: -1.5, usedChange7d: -0.9, sealedChange30d: -4.2, usedChange30d: -2.9, rarityScore: 5, demandScore: 7, trend: 'stable', volatility: 0.015 },
  { setNum: '21319-1', sealedValue: 98.00, usedValue: 68.00, sealedChange24h: 2.2, usedChange24h: 1.1, sealedChange7d: 4.5, usedChange7d: 2.3, sealedChange30d: 12.5, usedChange30d: 7.9, rarityScore: 6, demandScore: 8, trend: 'up', volatility: 0.035 }
];

function buildValuations(): Map<string, SetValuation> {
  const map = new Map<string, SetValuation>();
  const now = new Date().toISOString();

  for (const seed of valuationSeeds) {
    const set = mockSets.find(s => s.setNum === seed.setNum);
    const basePrice = set?.retailPrice ?? seed.sealedValue * 0.6;
    const priceHistory = generatePriceHistory(basePrice, 12, seed.trend as 'up'|'down'|'stable', seed.volatility);

    if (priceHistory.length > 0) {
      priceHistory[priceHistory.length - 1] = {
        date: priceHistory[priceHistory.length - 1].date,
        sealed: seed.sealedValue,
        used: seed.usedValue
      };
    }

    map.set(seed.setNum, {
      setNum: seed.setNum,
      sealedValue: seed.sealedValue,
      usedValue: seed.usedValue,
      resaleAvg: Math.round(((seed.sealedValue + seed.usedValue) / 2) * 100) / 100,
      sealedChange24h: seed.sealedChange24h,
      usedChange24h: seed.usedChange24h,
      sealedChange7d: seed.sealedChange7d,
      usedChange7d: seed.usedChange7d,
      sealedChange30d: seed.sealedChange30d,
      usedChange30d: seed.usedChange30d,
      rarityScore: seed.rarityScore,
      demandScore: seed.demandScore,
      priceHistory,
      lastUpdated: now
    });
  }
  return map;
}

export const mockValuations: Map<string, SetValuation> = buildValuations();

// Pre-seeded collection items
export const mockCollection: CollectionItem[] = [
  {
    id: 'col-01',
    userId: 'user-1',
    setNum: '75192-1',
    condition: 'sealed',
    quantity: 1,
    purchasePrice: 849.99,
    purchaseDate: '2023-12-25',
    notes: 'Kept sealed in box art container.',
    addedAt: '2024-01-02T10:30:00Z',
    itemType: 'set'
  },
  {
    id: 'col-02',
    userId: 'user-1',
    setNum: 'inf001',
    condition: 'used',
    quantity: 2,
    purchasePrice: 90.00,
    purchaseDate: '2024-02-15',
    notes: 'Excellent condition minifigure from LEGO Island.',
    addedAt: '2024-02-15T14:20:00Z',
    itemType: 'minifig'
  }
];

// Pre-seeded wishlists / monitors
export const mockWishlist: WishlistItem[] = [
  {
    id: 'wish-01',
    userId: 'user-1',
    setNum: '10270-1',
    targetPrice: 280.00,
    alertEnabled: true,
    addedAt: '2024-06-01T10:00:00Z',
    itemType: 'set'
  },
  {
    id: 'wish-02',
    userId: 'user-1',
    setNum: 'njo0108',
    targetPrice: 480.00,
    alertEnabled: true,
    addedAt: '2024-07-15T14:30:00Z',
    itemType: 'minifig'
  }
];

export function getSetByNum(setNum: string): LegoSet | undefined {
  return mockSets.find(s => s.setNum === setNum);
}

export function getValuation(setNum: string): SetValuation | undefined {
  return mockValuations.get(setNum);
}

export const trendingSets: LegoSet[] = [...mockSets].slice(0, 3);
export const retiringsSoonSets: LegoSet[] = [...mockSets].filter(s => s.isRetired).slice(0, 2);
