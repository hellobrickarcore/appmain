// ─── HelloBrick Mock Data ───────────────────────────────────────────────────
//
// 30 realistic LEGO sets spanning 8 themes with full valuations,
// collection items, wishlist, and derived data.
// ────────────────────────────────────────────────────────────────────────────

import type {
  LegoSet,
  SetValuation,
  CollectionItem,
  WishlistItem,
} from '@/types';

import { generatePriceHistory } from './utils';

// ─── Helper: image URL ──────────────────────────────────────────────────────

function setImage(setNum: string): string {
  return `https://cdn.rebrickable.com/media/sets/${setNum}.jpg`;
}

// ─── LEGO Sets ──────────────────────────────────────────────────────────────

export const mockSets: LegoSet[] = [
  // ── Creator Expert / Icons (5) ──────────────────────────────────────────
  {
    id: 'set-01',
    setNum: '10270-1',
    name: 'Bookshop',
    year: 2020,
    theme: 'Creator Expert',
    themeId: 672,
    numParts: 2504,
    imageUrl: setImage('10270-1'),
    retailPrice: 179.99,
    isRetired: true,
  },
  {
    id: 'set-02',
    setNum: '10182-1',
    name: 'Café Corner',
    year: 2007,
    theme: 'Creator Expert',
    themeId: 672,
    numParts: 2056,
    imageUrl: setImage('10182-1'),
    retailPrice: 139.99,
    isRetired: true,
  },
  {
    id: 'set-03',
    setNum: '10273-1',
    name: 'Haunted House',
    year: 2020,
    theme: 'Creator Expert',
    themeId: 672,
    numParts: 3231,
    imageUrl: setImage('10273-1'),
    retailPrice: 249.99,
    isRetired: true,
  },
  {
    id: 'set-04',
    setNum: '10297-1',
    name: 'Boutique Hotel',
    year: 2022,
    theme: 'Icons',
    themeId: 672,
    numParts: 3066,
    imageUrl: setImage('10297-1'),
    retailPrice: 199.99,
    isRetired: true,
  },
  {
    id: 'set-05',
    setNum: '10294-1',
    name: 'Titanic',
    year: 2021,
    theme: 'Icons',
    themeId: 672,
    numParts: 9090,
    imageUrl: setImage('10294-1'),
    retailPrice: 629.99,
    isRetired: false,
  },

  // ── Star Wars (6) ──────────────────────────────────────────────────────
  {
    id: 'set-06',
    setNum: '75192-1',
    name: 'Millennium Falcon',
    year: 2017,
    theme: 'Star Wars',
    themeId: 158,
    numParts: 7541,
    imageUrl: setImage('75192-1'),
    retailPrice: 849.99,
    isRetired: false,
  },
  {
    id: 'set-07',
    setNum: '75313-1',
    name: 'AT-AT',
    year: 2021,
    theme: 'Star Wars',
    themeId: 158,
    numParts: 6785,
    imageUrl: setImage('75313-1'),
    retailPrice: 799.99,
    isRetired: true,
  },
  {
    id: 'set-08',
    setNum: '75252-1',
    name: 'Imperial Star Destroyer',
    year: 2019,
    theme: 'Star Wars',
    themeId: 158,
    numParts: 4784,
    imageUrl: setImage('75252-1'),
    retailPrice: 699.99,
    isRetired: true,
  },
  {
    id: 'set-09',
    setNum: '75290-1',
    name: 'Mos Eisley Cantina',
    year: 2020,
    theme: 'Star Wars',
    themeId: 158,
    numParts: 3187,
    imageUrl: setImage('75290-1'),
    retailPrice: 349.99,
    isRetired: true,
  },
  {
    id: 'set-10',
    setNum: '75309-1',
    name: 'Republic Gunship',
    year: 2021,
    theme: 'Star Wars',
    themeId: 158,
    numParts: 3292,
    imageUrl: setImage('75309-1'),
    retailPrice: 349.99,
    isRetired: true,
  },
  {
    id: 'set-11',
    setNum: '75331-1',
    name: 'The Razor Crest',
    year: 2022,
    theme: 'Star Wars',
    themeId: 158,
    numParts: 6187,
    imageUrl: setImage('75331-1'),
    retailPrice: 599.99,
    isRetired: true,
  },

  // ── Technic (4) ────────────────────────────────────────────────────────
  {
    id: 'set-12',
    setNum: '42115-1',
    name: 'Lamborghini Sián FKP 37',
    year: 2020,
    theme: 'Technic',
    themeId: 1,
    numParts: 3696,
    imageUrl: setImage('42115-1'),
    retailPrice: 379.99,
    isRetired: true,
  },
  {
    id: 'set-13',
    setNum: '42083-1',
    name: 'Bugatti Chiron',
    year: 2018,
    theme: 'Technic',
    themeId: 1,
    numParts: 3599,
    imageUrl: setImage('42083-1'),
    retailPrice: 349.99,
    isRetired: true,
  },
  {
    id: 'set-14',
    setNum: '42056-1',
    name: 'Porsche 911 GT3 RS',
    year: 2016,
    theme: 'Technic',
    themeId: 1,
    numParts: 2704,
    imageUrl: setImage('42056-1'),
    retailPrice: 299.99,
    isRetired: true,
  },
  {
    id: 'set-15',
    setNum: '42131-1',
    name: 'Cat D11 Bulldozer',
    year: 2021,
    theme: 'Technic',
    themeId: 1,
    numParts: 3854,
    imageUrl: setImage('42131-1'),
    retailPrice: 449.99,
    isRetired: true,
  },

  // ── Harry Potter (4) ──────────────────────────────────────────────────
  {
    id: 'set-16',
    setNum: '71043-1',
    name: 'Hogwarts Castle',
    year: 2018,
    theme: 'Harry Potter',
    themeId: 246,
    numParts: 6020,
    imageUrl: setImage('71043-1'),
    retailPrice: 399.99,
    isRetired: true,
  },
  {
    id: 'set-17',
    setNum: '75978-1',
    name: 'Diagon Alley',
    year: 2020,
    theme: 'Harry Potter',
    themeId: 246,
    numParts: 5544,
    imageUrl: setImage('75978-1'),
    retailPrice: 399.99,
    isRetired: true,
  },
  {
    id: 'set-18',
    setNum: '76405-1',
    name: 'Hogwarts Express – Collectors\' Edition',
    year: 2022,
    theme: 'Harry Potter',
    themeId: 246,
    numParts: 5129,
    imageUrl: setImage('76405-1'),
    retailPrice: 499.99,
    isRetired: true,
  },
  {
    id: 'set-19',
    setNum: '76388-1',
    name: 'Hogsmeade Village Visit',
    year: 2021,
    theme: 'Harry Potter',
    themeId: 246,
    numParts: 851,
    imageUrl: setImage('76388-1'),
    retailPrice: 79.99,
    isRetired: true,
  },

  // ── Architecture (3) ──────────────────────────────────────────────────
  {
    id: 'set-20',
    setNum: '10276-1',
    name: 'Colosseum',
    year: 2020,
    theme: 'Icons',
    themeId: 672,
    numParts: 9036,
    imageUrl: setImage('10276-1'),
    retailPrice: 549.99,
    isRetired: false,
  },
  {
    id: 'set-21',
    setNum: '10256-1',
    name: 'Taj Mahal',
    year: 2017,
    theme: 'Creator Expert',
    themeId: 672,
    numParts: 5923,
    imageUrl: setImage('10256-1'),
    retailPrice: 369.99,
    isRetired: true,
  },
  {
    id: 'set-22',
    setNum: '21042-1',
    name: 'Statue of Liberty',
    year: 2018,
    theme: 'Architecture',
    themeId: 252,
    numParts: 1685,
    imageUrl: setImage('21042-1'),
    retailPrice: 119.99,
    isRetired: true,
  },

  // ── Ideas (3) ─────────────────────────────────────────────────────────
  {
    id: 'set-23',
    setNum: '21318-1',
    name: 'Tree House',
    year: 2019,
    theme: 'Ideas',
    themeId: 535,
    numParts: 3036,
    imageUrl: setImage('21318-1'),
    retailPrice: 249.99,
    isRetired: true,
  },
  {
    id: 'set-24',
    setNum: '21332-1',
    name: 'The Globe',
    year: 2022,
    theme: 'Ideas',
    themeId: 535,
    numParts: 2585,
    imageUrl: setImage('21332-1'),
    retailPrice: 229.99,
    isRetired: false,
  },
  {
    id: 'set-25',
    setNum: '21323-1',
    name: 'Grand Piano',
    year: 2020,
    theme: 'Ideas',
    themeId: 535,
    numParts: 3662,
    imageUrl: setImage('21323-1'),
    retailPrice: 349.99,
    isRetired: true,
  },

  // ── Super Heroes (3) ──────────────────────────────────────────────────
  {
    id: 'set-26',
    setNum: '76178-1',
    name: 'Daily Bugle',
    year: 2021,
    theme: 'Super Heroes',
    themeId: 696,
    numParts: 3772,
    imageUrl: setImage('76178-1'),
    retailPrice: 349.99,
    isRetired: true,
  },
  {
    id: 'set-27',
    setNum: '76252-1',
    name: 'Batcave – Shadow Box',
    year: 2022,
    theme: 'Super Heroes',
    themeId: 696,
    numParts: 4766,
    imageUrl: setImage('76252-1'),
    retailPrice: 399.99,
    isRetired: true,
  },
  {
    id: 'set-28',
    setNum: '76210-1',
    name: 'Hulkbuster',
    year: 2022,
    theme: 'Super Heroes',
    themeId: 696,
    numParts: 4049,
    imageUrl: setImage('76210-1'),
    retailPrice: 549.99,
    isRetired: true,
  },

  // ── City / Other (2) ──────────────────────────────────────────────────
  {
    id: 'set-29',
    setNum: '10283-1',
    name: 'NASA Space Shuttle Discovery',
    year: 2021,
    theme: 'Icons',
    themeId: 672,
    numParts: 2354,
    imageUrl: setImage('10283-1'),
    retailPrice: 199.99,
    isRetired: true,
  },
  {
    id: 'set-30',
    setNum: '10280-1',
    name: 'Flower Bouquet',
    year: 2021,
    theme: 'Icons',
    themeId: 672,
    numParts: 756,
    imageUrl: setImage('10280-1'),
    retailPrice: 59.99,
    isRetired: false,
  },
];

// ─── Valuation Data ─────────────────────────────────────────────────────────

interface ValuationSeed {
  setNum: string;
  sealedValue: number;
  usedValue: number;
  sealedChange24h: number;
  usedChange24h: number;
  sealedChange7d: number;
  usedChange7d: number;
  sealedChange30d: number;
  usedChange30d: number;
  rarityScore: number;
  demandScore: number;
  trend: 'up' | 'down' | 'stable';
  volatility: number;
}

const valuationSeeds: ValuationSeed[] = [
  // Creator Expert / Icons
  { setNum: '10270-1', sealedValue: 329.99, usedValue: 234.99, sealedChange24h: 1.2, usedChange24h: 0.8, sealedChange7d: 3.4, usedChange7d: 2.1, sealedChange30d: 8.7, usedChange30d: 5.2, rarityScore: 7, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '10182-1', sealedValue: 3249.99, usedValue: 2099.99, sealedChange24h: 0.3, usedChange24h: -0.1, sealedChange7d: 1.2, usedChange7d: 0.9, sealedChange30d: 4.5, usedChange30d: 2.8, rarityScore: 10, demandScore: 9, trend: 'up', volatility: 0.04 },
  { setNum: '10273-1', sealedValue: 489.99, usedValue: 349.99, sealedChange24h: 2.1, usedChange24h: 1.4, sealedChange7d: 5.8, usedChange7d: 3.9, sealedChange30d: 12.3, usedChange30d: 8.1, rarityScore: 8, demandScore: 9, trend: 'up', volatility: 0.035 },
  { setNum: '10297-1', sealedValue: 259.99, usedValue: 179.99, sealedChange24h: 0.5, usedChange24h: 0.2, sealedChange7d: 1.8, usedChange7d: 1.1, sealedChange30d: 4.2, usedChange30d: 2.9, rarityScore: 5, demandScore: 6, trend: 'up', volatility: 0.025 },
  { setNum: '10294-1', sealedValue: 649.99, usedValue: 489.99, sealedChange24h: -0.2, usedChange24h: -0.4, sealedChange7d: 0.5, usedChange7d: 0.3, sealedChange30d: 1.2, usedChange30d: 0.8, rarityScore: 4, demandScore: 7, trend: 'stable', volatility: 0.015 },

  // Star Wars
  { setNum: '75192-1', sealedValue: 879.99, usedValue: 649.99, sealedChange24h: 0.1, usedChange24h: 0.3, sealedChange7d: 0.8, usedChange7d: 0.6, sealedChange30d: 2.1, usedChange30d: 1.5, rarityScore: 5, demandScore: 10, trend: 'stable', volatility: 0.02 },
  { setNum: '75313-1', sealedValue: 1149.99, usedValue: 819.99, sealedChange24h: 1.8, usedChange24h: 1.2, sealedChange7d: 4.2, usedChange7d: 3.1, sealedChange30d: 9.8, usedChange30d: 7.2, rarityScore: 7, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '75252-1', sealedValue: 1389.99, usedValue: 949.99, sealedChange24h: 0.9, usedChange24h: 0.5, sealedChange7d: 2.7, usedChange7d: 1.8, sealedChange30d: 6.4, usedChange30d: 4.1, rarityScore: 8, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '75290-1', sealedValue: 579.99, usedValue: 399.99, sealedChange24h: 1.5, usedChange24h: 0.9, sealedChange7d: 3.8, usedChange7d: 2.4, sealedChange30d: 11.2, usedChange30d: 7.8, rarityScore: 7, demandScore: 9, trend: 'up', volatility: 0.035 },
  { setNum: '75309-1', sealedValue: 499.99, usedValue: 339.99, sealedChange24h: 0.4, usedChange24h: 0.2, sealedChange7d: 1.5, usedChange7d: 0.9, sealedChange30d: 5.1, usedChange30d: 3.4, rarityScore: 6, demandScore: 7, trend: 'up', volatility: 0.025 },
  { setNum: '75331-1', sealedValue: 869.99, usedValue: 619.99, sealedChange24h: 2.4, usedChange24h: 1.7, sealedChange7d: 6.1, usedChange7d: 4.3, sealedChange30d: 14.2, usedChange30d: 10.1, rarityScore: 8, demandScore: 9, trend: 'up', volatility: 0.04 },

  // Technic
  { setNum: '42115-1', sealedValue: 549.99, usedValue: 389.99, sealedChange24h: 0.7, usedChange24h: 0.4, sealedChange7d: 2.3, usedChange7d: 1.6, sealedChange30d: 6.8, usedChange30d: 4.5, rarityScore: 7, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '42083-1', sealedValue: 619.99, usedValue: 429.99, sealedChange24h: 0.6, usedChange24h: 0.3, sealedChange7d: 1.9, usedChange7d: 1.2, sealedChange30d: 5.4, usedChange30d: 3.2, rarityScore: 7, demandScore: 7, trend: 'up', volatility: 0.025 },
  { setNum: '42056-1', sealedValue: 589.99, usedValue: 379.99, sealedChange24h: 0.2, usedChange24h: -0.3, sealedChange7d: 0.8, usedChange7d: 0.4, sealedChange30d: 2.1, usedChange30d: 1.0, rarityScore: 8, demandScore: 6, trend: 'stable', volatility: 0.02 },
  { setNum: '42131-1', sealedValue: 679.99, usedValue: 479.99, sealedChange24h: 1.1, usedChange24h: 0.7, sealedChange7d: 3.2, usedChange7d: 2.1, sealedChange30d: 7.9, usedChange30d: 5.3, rarityScore: 7, demandScore: 7, trend: 'up', volatility: 0.03 },

  // Harry Potter
  { setNum: '71043-1', sealedValue: 749.99, usedValue: 519.99, sealedChange24h: 1.3, usedChange24h: 0.8, sealedChange7d: 3.6, usedChange7d: 2.4, sealedChange30d: 8.9, usedChange30d: 6.1, rarityScore: 8, demandScore: 9, trend: 'up', volatility: 0.03 },
  { setNum: '75978-1', sealedValue: 699.99, usedValue: 489.99, sealedChange24h: 1.6, usedChange24h: 1.1, sealedChange7d: 4.5, usedChange7d: 3.0, sealedChange30d: 10.8, usedChange30d: 7.4, rarityScore: 8, demandScore: 9, trend: 'up', volatility: 0.035 },
  { setNum: '76405-1', sealedValue: 599.99, usedValue: 419.99, sealedChange24h: -0.5, usedChange24h: -0.8, sealedChange7d: -1.2, usedChange7d: -1.8, sealedChange30d: -3.4, usedChange30d: -4.9, rarityScore: 5, demandScore: 5, trend: 'down', volatility: 0.03 },
  { setNum: '76388-1', sealedValue: 109.99, usedValue: 69.99, sealedChange24h: 0.3, usedChange24h: 0.1, sealedChange7d: 1.1, usedChange7d: 0.6, sealedChange30d: 3.8, usedChange30d: 2.2, rarityScore: 4, demandScore: 5, trend: 'stable', volatility: 0.02 },

  // Architecture
  { setNum: '10276-1', sealedValue: 569.99, usedValue: 419.99, sealedChange24h: -0.1, usedChange24h: -0.3, sealedChange7d: 0.4, usedChange7d: 0.2, sealedChange30d: 1.5, usedChange30d: 0.9, rarityScore: 4, demandScore: 7, trend: 'stable', volatility: 0.015 },
  { setNum: '10256-1', sealedValue: 649.99, usedValue: 449.99, sealedChange24h: 0.4, usedChange24h: 0.2, sealedChange7d: 1.3, usedChange7d: 0.8, sealedChange30d: 3.9, usedChange30d: 2.4, rarityScore: 7, demandScore: 6, trend: 'up', volatility: 0.025 },
  { setNum: '21042-1', sealedValue: 169.99, usedValue: 109.99, sealedChange24h: -0.2, usedChange24h: -0.5, sealedChange7d: -0.8, usedChange7d: -1.2, sealedChange30d: -2.1, usedChange30d: -3.5, rarityScore: 3, demandScore: 4, trend: 'down', volatility: 0.025 },

  // Ideas
  { setNum: '21318-1', sealedValue: 449.99, usedValue: 319.99, sealedChange24h: 1.0, usedChange24h: 0.6, sealedChange7d: 2.8, usedChange7d: 1.9, sealedChange30d: 7.4, usedChange30d: 5.1, rarityScore: 7, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '21332-1', sealedValue: 234.99, usedValue: 169.99, sealedChange24h: 0.1, usedChange24h: -0.1, sealedChange7d: 0.3, usedChange7d: 0.1, sealedChange30d: 0.8, usedChange30d: 0.4, rarityScore: 3, demandScore: 5, trend: 'stable', volatility: 0.015 },
  { setNum: '21323-1', sealedValue: 529.99, usedValue: 369.99, sealedChange24h: 0.8, usedChange24h: 0.4, sealedChange7d: 2.1, usedChange7d: 1.4, sealedChange30d: 5.6, usedChange30d: 3.8, rarityScore: 6, demandScore: 7, trend: 'up', volatility: 0.025 },

  // Super Heroes
  { setNum: '76178-1', sealedValue: 599.99, usedValue: 419.99, sealedChange24h: 1.9, usedChange24h: 1.3, sealedChange7d: 5.2, usedChange7d: 3.6, sealedChange30d: 13.1, usedChange30d: 9.2, rarityScore: 8, demandScore: 9, trend: 'up', volatility: 0.04 },
  { setNum: '76252-1', sealedValue: 489.99, usedValue: 339.99, sealedChange24h: 0.3, usedChange24h: 0.1, sealedChange7d: 0.9, usedChange7d: 0.5, sealedChange30d: 3.2, usedChange30d: 1.8, rarityScore: 5, demandScore: 6, trend: 'stable', volatility: 0.02 },
  { setNum: '76210-1', sealedValue: 649.99, usedValue: 449.99, sealedChange24h: -0.4, usedChange24h: -0.7, sealedChange7d: -1.5, usedChange7d: -2.1, sealedChange30d: -4.2, usedChange30d: -5.8, rarityScore: 5, demandScore: 5, trend: 'down', volatility: 0.03 },

  // City / Other
  { setNum: '10283-1', sealedValue: 349.99, usedValue: 249.99, sealedChange24h: 1.4, usedChange24h: 0.9, sealedChange7d: 3.9, usedChange7d: 2.7, sealedChange30d: 9.6, usedChange30d: 6.8, rarityScore: 7, demandScore: 8, trend: 'up', volatility: 0.03 },
  { setNum: '10280-1', sealedValue: 59.99, usedValue: 39.99, sealedChange24h: 0.0, usedChange24h: -0.2, sealedChange7d: 0.1, usedChange7d: -0.1, sealedChange30d: 0.3, usedChange30d: 0.1, rarityScore: 2, demandScore: 6, trend: 'stable', volatility: 0.01 },
];

// Build valuations map with generated price histories
function buildValuations(): Map<string, SetValuation> {
  const map = new Map<string, SetValuation>();
  const now = new Date().toISOString();

  for (const seed of valuationSeeds) {
    const set = mockSets.find((s) => s.setNum === seed.setNum);
    const basePrice = set?.retailPrice ?? seed.sealedValue * 0.6;

    const priceHistory = generatePriceHistory(
      basePrice,
      12,
      seed.trend,
      seed.volatility,
    );

    // Adjust the final point to match current valuation
    if (priceHistory.length > 0) {
      priceHistory[priceHistory.length - 1] = {
        date: priceHistory[priceHistory.length - 1].date,
        sealed: seed.sealedValue,
        used: seed.usedValue,
      };
    }

    const resaleAvg = Math.round(((seed.sealedValue + seed.usedValue) / 2) * 100) / 100;

    map.set(seed.setNum, {
      setNum: seed.setNum,
      sealedValue: seed.sealedValue,
      usedValue: seed.usedValue,
      resaleAvg,
      sealedChange24h: seed.sealedChange24h,
      usedChange24h: seed.usedChange24h,
      sealedChange7d: seed.sealedChange7d,
      usedChange7d: seed.usedChange7d,
      sealedChange30d: seed.sealedChange30d,
      usedChange30d: seed.usedChange30d,
      rarityScore: seed.rarityScore,
      demandScore: seed.demandScore,
      priceHistory,
      lastUpdated: now,
    });
  }

  return map;
}

export const mockValuations: Map<string, SetValuation> = buildValuations();

// ─── Collection Items (8 sets the user owns) ────────────────────────────────

export const mockCollection: CollectionItem[] = [
  {
    id: 'col-01',
    userId: 'user-1',
    setNum: '75192-1',
    condition: 'sealed',
    purchasePrice: 849.99,
    purchaseDate: '2023-12-25',
    addedAt: '2024-01-02T10:30:00Z',
    notes: 'Christmas gift, keeping sealed as investment',
  },
  {
    id: 'col-02',
    userId: 'user-1',
    setNum: '10270-1',
    condition: 'used',
    purchasePrice: 179.99,
    purchaseDate: '2020-06-15',
    addedAt: '2024-01-15T14:20:00Z',
    notes: 'Built and displayed on modular street',
  },
  {
    id: 'col-03',
    userId: 'user-1',
    setNum: '42115-1',
    condition: 'sealed',
    purchasePrice: 379.99,
    purchaseDate: '2022-03-10',
    addedAt: '2024-02-01T09:00:00Z',
    notes: 'Picked up on sale, sealed for value',
  },
  {
    id: 'col-04',
    userId: 'user-1',
    setNum: '71043-1',
    condition: 'used',
    purchasePrice: 399.99,
    purchaseDate: '2019-11-20',
    addedAt: '2024-02-14T16:45:00Z',
    notes: 'Built – amazing display piece',
  },
  {
    id: 'col-05',
    userId: 'user-1',
    setNum: '76178-1',
    condition: 'sealed',
    purchasePrice: 299.99,
    purchaseDate: '2023-06-01',
    addedAt: '2024-03-05T11:15:00Z',
    notes: 'Got on clearance at Target, great deal',
  },
  {
    id: 'col-06',
    userId: 'user-1',
    setNum: '21318-1',
    condition: 'used',
    purchasePrice: 249.99,
    purchaseDate: '2020-09-12',
    addedAt: '2024-03-20T08:30:00Z',
    notes: 'Family build project, all bags opened',
  },
  {
    id: 'col-07',
    userId: 'user-1',
    setNum: '75290-1',
    condition: 'sealed',
    purchasePrice: 349.99,
    purchaseDate: '2021-04-04',
    addedAt: '2024-04-10T13:00:00Z',
    notes: 'Star Wars day purchase, keeping sealed',
  },
  {
    id: 'col-08',
    userId: 'user-1',
    setNum: '10283-1',
    condition: 'used',
    purchasePrice: 199.99,
    purchaseDate: '2022-07-20',
    addedAt: '2024-05-01T15:30:00Z',
    notes: 'Built for desk display',
  },
];

// ─── Wishlist Items (4) ─────────────────────────────────────────────────────

export const mockWishlist: WishlistItem[] = [
  {
    id: 'wish-01',
    userId: 'user-1',
    setNum: '10182-1',
    targetPrice: 2500.0,
    addedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'wish-02',
    userId: 'user-1',
    setNum: '75331-1',
    targetPrice: 750.0,
    addedAt: '2024-07-15T14:30:00Z',
  },
  {
    id: 'wish-03',
    userId: 'user-1',
    setNum: '10273-1',
    targetPrice: 400.0,
    addedAt: '2024-08-20T09:00:00Z',
  },
  {
    id: 'wish-04',
    userId: 'user-1',
    setNum: '42083-1',
    targetPrice: null,
    addedAt: '2024-09-10T16:00:00Z',
  },
];

// ─── Portfolio History (12 months) ──────────────────────────────────────────

function buildPortfolioHistory(): { date: string; value: number }[] {
  const history: { date: string; value: number }[] = [];
  const now = new Date();

  // Calculate current total portfolio value
  let currentTotal = 0;
  for (const item of mockCollection) {
    const val = mockValuations.get(item.setNum);
    if (val) {
      currentTotal +=
        item.condition === 'sealed' ? val.sealedValue : val.usedValue;
    }
  }

  // Simulate 12-month growth from ~80% of current value
  const startValue = currentTotal * 0.78;

  for (let i = 12; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);

    const progress = (12 - i) / 12;
    // Smooth growth with some monthly variation
    const growthCurve = Math.pow(progress, 0.85);
    const seasonalVariation = Math.sin(progress * Math.PI * 2.5) * currentTotal * 0.015;
    const value = startValue + (currentTotal - startValue) * growthCurve + seasonalVariation;

    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    });
  }

  // Ensure the last data point matches the actual current total
  if (history.length > 0) {
    history[history.length - 1].value = Math.round(currentTotal * 100) / 100;
  }

  return history;
}

export const mockPortfolioHistory = buildPortfolioHistory();

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

const setsByNum = new Map(mockSets.map((s) => [s.setNum, s]));

/**
 * Look up a LEGO set by its set number.
 */
export function getSetByNum(setNum: string): LegoSet | undefined {
  return setsByNum.get(setNum);
}

/**
 * Look up a valuation by set number.
 */
export function getValuation(setNum: string): SetValuation | undefined {
  return mockValuations.get(setNum);
}

// ─── Trending Sets (6 sets with biggest recent gains) ───────────────────────

export const trendingSets: LegoSet[] = [...mockSets]
  .filter((set) => {
    const val = mockValuations.get(set.setNum);
    return val && val.sealedChange30d > 0;
  })
  .sort((a, b) => {
    const valA = mockValuations.get(a.setNum)!;
    const valB = mockValuations.get(b.setNum)!;
    return valB.sealedChange30d - valA.sealedChange30d;
  })
  .slice(0, 6);

// ─── Retiring Soon Sets (4 sets about to retire) ───────────────────────────

export const retiringsSoonSets: LegoSet[] = mockSets
  .filter((set) => !set.isRetired)
  .slice(0, 4);
