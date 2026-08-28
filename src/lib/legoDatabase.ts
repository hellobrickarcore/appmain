// src/lib/legoDatabase.ts
// Comprehensive Master Collectibles Database for HelloBrick (Sets, Minifigures, MOCs, Cards)

export type CollectibleCategory = 'set' | 'minifigure' | 'moc' | 'card';
export type InvestmentRating = 'Grail' | 'Blue Chip' | 'Strong Buy' | 'Hold' | 'Speculative';

export interface BaseCollectible {
  id: string;
  code: string; // setNum, figNum, or cardId
  name: string;
  theme: string;
  category: CollectibleCategory;
  year: number;
  retailPrice: number;
  sealedPrice: number;
  usedPrice: number;
  growth1Y: number; // e.g. 24.5 (%)
  growth30D: number; // e.g. 3.2 (%)
  rarityScore: number; // 1-10
  demandScore: number; // 1-10
  rating: InvestmentRating;
  imageUrl: string;
  isRetired: boolean;
  retiresInMonths?: number;
  description: string;
}

export interface LegoSetItem extends BaseCollectible {
  category: 'set';
  pieces: number;
  minifigsCount: number;
  partOutValue: number;
  subtheme?: string;
}

export interface MinifigureItem extends BaseCollectible {
  category: 'minifigure';
  exclusiveSetNum?: string;
  exclusiveSetName?: string;
  conditionGrade?: string;
}

export interface MocBuildItem extends BaseCollectible {
  category: 'moc';
  pieceCount: number;
  matchPercentage: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  designer: string;
}

export interface CollectibleCardItem extends BaseCollectible {
  category: 'card';
  cardNumber: string;
  psa10Value: number;
  psa9Value: number;
  rawCondition: string;
}

export type AnyCollectible = LegoSetItem | MinifigureItem | MocBuildItem | CollectibleCardItem;

// ── 1. MASTER LEGO SETS DATABASE ──────────────────────────────
export const MASTER_SETS: LegoSetItem[] = [
  {
    id: 'set-75192',
    code: '75192-1',
    name: 'Millennium Falcon (UCS)',
    theme: 'Star Wars',
    subtheme: 'Ultimate Collector Series',
    category: 'set',
    year: 2017,
    pieces: 7541,
    minifigsCount: 8,
    retailPrice: 849.99,
    sealedPrice: 940.00,
    usedPrice: 620.00,
    partOutValue: 1450.00,
    growth1Y: 18.4,
    growth30D: 2.1,
    rarityScore: 9,
    demandScore: 10,
    rating: 'Blue Chip',
    imageUrl: 'https://images.brickset.com/sets/images/75192-1.jpg',
    isRetired: false,
    description: 'The definitive LEGO Star Wars centerpiece with 7,541 pieces, interior details, and interchangeable sensor dishes.'
  },
  {
    id: 'set-10316',
    code: '10316-1',
    name: 'The Lord of the Rings: Rivendell',
    theme: 'Icons',
    subtheme: 'The Lord of the Rings',
    category: 'set',
    year: 2023,
    pieces: 6167,
    minifigsCount: 15,
    retailPrice: 499.99,
    sealedPrice: 580.00,
    usedPrice: 390.00,
    partOutValue: 880.00,
    growth1Y: 24.1,
    growth30D: 4.5,
    rarityScore: 8,
    demandScore: 10,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/10316-1.jpg',
    isRetired: false,
    description: 'Breathtaking recreation of the Elven sanctuary in Middle-earth with 15 exclusive Fellowship minifigures.'
  },
  {
    id: 'set-10305',
    code: '10305-1',
    name: "Lion Knights' Castle",
    theme: 'Icons',
    subtheme: 'Classic Castle 90th Anniversary',
    category: 'set',
    year: 2022,
    pieces: 4514,
    minifigsCount: 22,
    retailPrice: 399.99,
    sealedPrice: 460.00,
    usedPrice: 320.00,
    partOutValue: 740.00,
    growth1Y: 15.2,
    growth30D: 1.8,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Blue Chip',
    imageUrl: 'https://images.brickset.com/sets/images/10305-1.jpg',
    isRetired: false,
    description: 'Celebrated 90th anniversary masterpiece featuring working drawbridge, dungeon, armory, and 22 medieval minifigures.'
  },
  {
    id: 'set-75331',
    code: '75331-1',
    name: 'The Razor Crest (UCS)',
    theme: 'Star Wars',
    subtheme: 'The Mandalorian UCS',
    category: 'set',
    year: 2022,
    pieces: 6187,
    minifigsCount: 4,
    retailPrice: 599.99,
    sealedPrice: 650.00,
    usedPrice: 440.00,
    partOutValue: 980.00,
    growth1Y: 12.8,
    growth30D: 1.5,
    rarityScore: 7,
    demandScore: 8,
    rating: 'Hold',
    imageUrl: 'https://images.brickset.com/sets/images/75331-1.jpg',
    isRetired: false,
    description: "Din Djarin's armored gunship featuring full interior cockpit, cargo bay with carbon-freezing chamber, and Mythrol."
  },
  {
    id: 'set-21325',
    code: '21325-1',
    name: 'Medieval Blacksmith',
    theme: 'Ideas',
    category: 'set',
    year: 2021,
    pieces: 2164,
    minifigsCount: 4,
    retailPrice: 179.99,
    sealedPrice: 310.00,
    usedPrice: 195.00,
    partOutValue: 420.00,
    growth1Y: 72.2,
    growth30D: 6.4,
    rarityScore: 9,
    demandScore: 9,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/21325-1.jpg',
    isRetired: true,
    description: 'Sensational retired Ideas set with glowing light-brick forge, timber framing, Black Falcon knights, and apple tree.'
  },
  {
    id: 'set-10294',
    code: '10294-1',
    name: 'Titanic',
    theme: 'Icons',
    category: 'set',
    year: 2021,
    pieces: 9090,
    minifigsCount: 0,
    retailPrice: 679.99,
    sealedPrice: 790.00,
    usedPrice: 590.00,
    partOutValue: 1250.00,
    growth1Y: 16.2,
    growth30D: 2.0,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Blue Chip',
    imageUrl: 'https://images.brickset.com/sets/images/10294-1.jpg',
    isRetired: false,
    description: 'One of the largest LEGO sets ever built at 1.35 meters long with cross-section grand staircase and piston engines.'
  },
  {
    id: 'set-76178',
    code: '76178-1',
    name: 'Daily Bugle',
    theme: 'Marvel',
    subtheme: 'Spider-Man',
    category: 'set',
    year: 2021,
    pieces: 3772,
    minifigsCount: 25,
    retailPrice: 349.99,
    sealedPrice: 390.00,
    usedPrice: 280.00,
    partOutValue: 690.00,
    growth1Y: 14.5,
    growth30D: 3.1,
    rarityScore: 7,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/76178-1.jpg',
    isRetired: false,
    retiresInMonths: 4,
    description: 'Towering 82cm skyscraper packed with 25 Marvel characters including Daredevil, Blade, Punisher, and J. Jonah Jameson.'
  },
  {
    id: 'set-75252',
    code: '75252-1',
    name: 'Imperial Star Destroyer (UCS)',
    theme: 'Star Wars',
    subtheme: 'Ultimate Collector Series',
    category: 'set',
    year: 2019,
    pieces: 4784,
    minifigsCount: 2,
    retailPrice: 699.99,
    sealedPrice: 1370.00,
    usedPrice: 790.00,
    partOutValue: 1650.00,
    growth1Y: 45.8,
    growth30D: 5.2,
    rarityScore: 9,
    demandScore: 8,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/75252-1.jpg',
    isRetired: true,
    description: 'Massive retired Star Destroyer flagship including scale Tantive IV Rebel blockade runner and Imperial crew.'
  },
  {
    id: 'set-42115',
    code: '42115-1',
    name: 'Lamborghini Sián FKP 37',
    theme: 'Technic',
    subtheme: 'Ultimate Supercar',
    category: 'set',
    year: 2020,
    pieces: 3696,
    minifigsCount: 0,
    retailPrice: 449.99,
    sealedPrice: 480.00,
    usedPrice: 310.00,
    partOutValue: 640.00,
    growth1Y: 9.2,
    growth30D: 1.1,
    rarityScore: 6,
    demandScore: 7,
    rating: 'Hold',
    imageUrl: 'https://images.brickset.com/sets/images/42115-1.jpg',
    isRetired: false,
    description: 'Lime green 1:8 scale supercar with 8-speed paddle gearbox, V12 engine with moving pistons, and scissor doors.'
  },
  {
    id: 'set-71043',
    code: '71043-1',
    name: 'Hogwarts Castle',
    theme: 'Harry Potter',
    category: 'set',
    year: 2018,
    pieces: 6020,
    minifigsCount: 4,
    retailPrice: 469.99,
    sealedPrice: 490.00,
    usedPrice: 320.00,
    partOutValue: 780.00,
    growth1Y: 8.5,
    growth30D: 1.0,
    rarityScore: 6,
    demandScore: 8,
    rating: 'Hold',
    imageUrl: 'https://images.brickset.com/sets/images/71043-1.jpg',
    isRetired: false,
    description: 'Microscale magical castle featuring Great Hall, Chamber of Secrets, Hagrid Hut, and 4 Hogwarts Founders minifigures.'
  },
  {
    id: 'set-10270',
    code: '10270-1',
    name: 'Bookshop (Modular Building)',
    theme: 'Creator Expert',
    subtheme: 'Modular Buildings',
    category: 'set',
    year: 2020,
    pieces: 2504,
    minifigsCount: 5,
    retailPrice: 199.99,
    sealedPrice: 285.00,
    usedPrice: 190.00,
    partOutValue: 390.00,
    growth1Y: 42.5,
    growth30D: 3.8,
    rarityScore: 8,
    demandScore: 8,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/10270-1.jpg',
    isRetired: true,
    description: 'Charming European style townhouse and Birch Books bookshop with birch tree and detailed interior furnishings.'
  },
  {
    id: 'set-21333',
    code: '21333-1',
    name: 'Vincent van Gogh - The Starry Night',
    theme: 'Ideas',
    category: 'set',
    year: 2022,
    pieces: 2316,
    minifigsCount: 1,
    retailPrice: 169.99,
    sealedPrice: 190.00,
    usedPrice: 130.00,
    partOutValue: 270.00,
    growth1Y: 11.8,
    growth30D: 2.3,
    rarityScore: 6,
    demandScore: 8,
    rating: 'Hold',
    imageUrl: 'https://images.brickset.com/sets/images/21333-1.jpg',
    isRetired: false,
    description: '3D wall-art reproduction in partnership with MoMA featuring an exclusive Vincent van Gogh minifigure with easel.'
  },
  {
    id: 'set-75313',
    code: '75313-1',
    name: 'AT-AT (UCS)',
    theme: 'Star Wars',
    subtheme: 'Ultimate Collector Series',
    category: 'set',
    year: 2021,
    pieces: 6785,
    minifigsCount: 9,
    retailPrice: 849.99,
    sealedPrice: 910.00,
    usedPrice: 650.00,
    partOutValue: 1380.00,
    growth1Y: 14.1,
    growth30D: 1.9,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/75313-1.jpg',
    isRetired: false,
    retiresInMonths: 8,
    description: 'Gigantic 62cm-tall Imperial Walker with posable legs, interior room for 40 minifigures, 4 speeder bikes, and E-Web cannon.'
  },
  {
    id: 'set-21056',
    code: '21056-1',
    name: 'Taj Mahal',
    theme: 'Architecture',
    category: 'set',
    year: 2021,
    pieces: 2022,
    minifigsCount: 0,
    retailPrice: 119.99,
    sealedPrice: 165.00,
    usedPrice: 105.00,
    partOutValue: 240.00,
    growth1Y: 37.5,
    growth30D: 4.1,
    rarityScore: 7,
    demandScore: 7,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/21056-1.jpg',
    isRetired: true,
    description: 'Exquisite architectural tribute with crypt with sarcophagi of Mumtaz and Shah Jahan, central dome, and 4 minarets.'
  },
  {
    id: 'set-10281',
    code: '10281-1',
    name: 'Bonsai Tree',
    theme: 'Botanical Collection',
    category: 'set',
    year: 2021,
    pieces: 878,
    minifigsCount: 0,
    retailPrice: 49.99,
    sealedPrice: 55.00,
    usedPrice: 38.00,
    partOutValue: 85.00,
    growth1Y: 10.0,
    growth30D: 1.5,
    rarityScore: 5,
    demandScore: 9,
    rating: 'Hold',
    imageUrl: 'https://images.brickset.com/sets/images/10281-1.jpg',
    isRetired: false,
    description: 'Iconic botanical display with interchangeable green leaves and vibrant pink cherry blossom frog blooms.'
  }
];

// ── 2. MASTER MINIFIGURES DATABASE ────────────────────────────
export const MASTER_MINIFIGS: MinifigureItem[] = [
  {
    id: 'fig-sw0107',
    code: 'sw0107',
    name: 'Boba Fett (Cloud City - Printed Arms & Legs)',
    theme: 'Star Wars',
    category: 'minifigure',
    year: 2003,
    retailPrice: 99.99,
    sealedPrice: 2650.00,
    usedPrice: 1850.00,
    growth1Y: 34.5,
    growth30D: 5.2,
    rarityScore: 10,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/10123-1.jpg',
    exclusiveSetNum: '10123-1',
    exclusiveSetName: 'Cloud City (2003)',
    isRetired: true,
    description: 'The undisputed holy grail of LEGO Star Wars minifigures with factory arm and leg printing released exclusively in 2003.'
  },
  {
    id: 'fig-col160',
    code: 'col160',
    name: 'Mr. Gold (Series 10 Chrome)',
    theme: 'Collectible Minifigures',
    category: 'minifigure',
    year: 2013,
    retailPrice: 2.99,
    sealedPrice: 4200.00,
    usedPrice: 3100.00,
    growth1Y: 28.0,
    growth30D: 4.1,
    rarityScore: 10,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/71001-19.jpg',
    exclusiveSetNum: '71001-19',
    exclusiveSetName: 'Series 10 CMF (Limited to 5,000 worldwide)',
    isRetired: true,
    description: 'Ultra-rare chrome gold plated minifigure with top hat and jewel staff. Only 5,000 uniquely numbered figures produced.'
  },
  {
    id: 'fig-njo0108',
    code: 'njo0108',
    name: 'Lloyd DX (Dragon Suit Ninjago)',
    theme: 'Ninjago',
    category: 'minifigure',
    year: 2014,
    retailPrice: 14.99,
    sealedPrice: 541.80,
    usedPrice: 380.00,
    growth1Y: 22.4,
    growth30D: 3.5,
    rarityScore: 9,
    demandScore: 9,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/9450-1.jpg',
    isRetired: true,
    description: 'Extremely sought-after Green Ninja in special edition Dragon Suit with gold shoulder armor.'
  },
  {
    id: 'fig-sw0547',
    code: 'sw0547',
    name: 'Darth Revan (May the 4th Polybag)',
    theme: 'Star Wars',
    category: 'minifigure',
    year: 2014,
    retailPrice: 4.99,
    sealedPrice: 285.00,
    usedPrice: 195.00,
    growth1Y: 31.2,
    growth30D: 6.0,
    rarityScore: 9,
    demandScore: 10,
    rating: 'Blue Chip',
    imageUrl: 'https://images.brickset.com/sets/images/5002123-1.jpg',
    exclusiveSetNum: '5002123-1',
    exclusiveSetName: 'Darth Revan May the 4th Promo',
    isRetired: true,
    description: 'Legendary Sith Lord from Knights of the Old Republic with dual crimson/purple lightsabers and Mandalorian mask.'
  },
  {
    id: 'fig-sh530',
    code: 'sh530',
    name: 'Spider-Man (PS4 Suit - SDCC Comic-Con 2019)',
    theme: 'Marvel',
    category: 'minifigure',
    year: 2019,
    retailPrice: 0.00,
    sealedPrice: 1150.00,
    usedPrice: 790.00,
    growth1Y: 19.5,
    growth30D: 2.8,
    rarityScore: 10,
    demandScore: 9,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/76178-1.jpg',
    exclusiveSetNum: 'SDCC2019',
    exclusiveSetName: 'San Diego Comic-Con 2019 Exclusive',
    isRetired: true,
    description: 'San Diego Comic-Con exclusive Advanced Suit Spider-Man inspired by the acclaimed Insomniac PlayStation title.'
  },
  {
    id: 'fig-sw0759',
    code: 'sw0759',
    name: 'Ahsoka Tano (Star Wars Rebels Adult)',
    theme: 'Star Wars',
    category: 'minifigure',
    year: 2016,
    retailPrice: 119.99,
    sealedPrice: 260.00,
    usedPrice: 180.00,
    growth1Y: 27.5,
    growth30D: 4.2,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/75158-1.jpg',
    exclusiveSetNum: '75158-1',
    exclusiveSetName: 'Rebel Combat Frigate',
    isRetired: true,
    description: 'Adult Fulcrum Ahsoka with dual curved white lightsabers and intricate lekku headpiece.'
  },
  {
    id: 'fig-sp007',
    code: 'sp007',
    name: 'Classic Yellow Astronaut (Vintage 1979)',
    theme: 'Vintage Space',
    category: 'minifigure',
    year: 1979,
    retailPrice: 2.50,
    sealedPrice: 65.00,
    usedPrice: 38.00,
    growth1Y: 14.0,
    growth30D: 1.2,
    rarityScore: 7,
    demandScore: 8,
    rating: 'Blue Chip',
    imageUrl: 'https://images.brickset.com/sets/images/10497-1.jpg',
    isRetired: true,
    description: 'Iconic golden-era Classic Space minifigure featuring golden visor print and original oxygen airtanks.'
  }
];

// ── 3. MASTER MOC BUILDS DATABASE ─────────────────────────────
export const MASTER_MOCS: MocBuildItem[] = [
  {
    id: 'moc-01',
    code: 'MOC-10497',
    name: 'Deep Space Recon Cruiser',
    theme: 'Space',
    category: 'moc',
    year: 2024,
    retailPrice: 45.00,
    sealedPrice: 95.00,
    usedPrice: 65.00,
    growth1Y: 18.0,
    growth30D: 2.5,
    rarityScore: 7,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/60351-1.jpg',
    isRetired: false,
    pieceCount: 380,
    matchPercentage: 92,
    difficulty: 'Medium',
    designer: 'BrickMaster_Alex',
    description: 'Custom neo-classic space cruiser with deployable planetary rover and modular cargo bay.'
  },
  {
    id: 'moc-02',
    code: 'MOC-10305',
    name: 'Black Falcon Mountain Outpost',
    theme: 'Castle',
    category: 'moc',
    year: 2023,
    retailPrice: 75.00,
    sealedPrice: 165.00,
    usedPrice: 120.00,
    growth1Y: 24.5,
    growth30D: 3.8,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/10305-1.jpg',
    isRetired: false,
    pieceCount: 650,
    matchPercentage: 84,
    difficulty: 'Hard',
    designer: 'Sir_Bricksalot',
    description: 'Heavily fortified stone guard tower built into rocky terrain with working portcullis.'
  },
  {
    id: 'moc-03',
    code: 'MOC-10281',
    name: 'Autumn Maple Bonsai',
    theme: 'Botanical',
    category: 'moc',
    year: 2024,
    retailPrice: 35.00,
    sealedPrice: 70.00,
    usedPrice: 48.00,
    growth1Y: 12.0,
    growth30D: 1.8,
    rarityScore: 6,
    demandScore: 8,
    rating: 'Hold',
    imageUrl: 'https://images.brickset.com/sets/images/10281-1.jpg',
    isRetired: false,
    pieceCount: 420,
    matchPercentage: 96,
    difficulty: 'Easy',
    designer: 'ZenBrickWorks',
    description: 'Alternate color transformation of set 10281 with fiery red, orange, and amber autumn canopy.'
  }
];

// ── 4. MASTER COLLECTIBLE CARDS DATABASE ──────────────────────
export const MASTER_CARDS: CollectibleCardItem[] = [
  {
    id: 'card-01',
    code: 'TCG-75192',
    cardNumber: '#001-UCS',
    name: 'Millennium Falcon Gold Foil Collector Card',
    theme: 'Star Wars Cards',
    category: 'card',
    year: 2017,
    retailPrice: 15.00,
    sealedPrice: 180.00,
    usedPrice: 95.00,
    psa10Value: 420.00,
    psa9Value: 210.00,
    rawCondition: 'Near Mint',
    growth1Y: 48.0,
    growth30D: 6.2,
    rarityScore: 9,
    demandScore: 9,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/75192-1.jpg',
    isRetired: true,
    description: 'Numbered VIP exclusive embossed gold foil commemorative card awarded to first-day UCS Millennium Falcon buyers.'
  },
  {
    id: 'card-02',
    code: 'TCG-CMF26',
    cardNumber: '#CMF-026',
    name: 'Space Astronaut Holographic QR Card',
    theme: 'CMF Series 26',
    category: 'card',
    year: 2024,
    retailPrice: 4.99,
    sealedPrice: 28.00,
    usedPrice: 14.00,
    psa10Value: 75.00,
    psa9Value: 35.00,
    rawCondition: 'Mint',
    growth1Y: 15.0,
    growth30D: 3.0,
    rarityScore: 7,
    demandScore: 8,
    rating: 'Strong Buy',
    imageUrl: 'https://images.brickset.com/sets/images/60351-1.jpg',
    isRetired: false,
    description: 'Holographic collector card with scannable matrix code for instant digital vault syncing.'
  }
];

// ── 5. ALL COLLECTIBLES UNIFIED ───────────────────────────────
export const ALL_COLLECTIBLES: AnyCollectible[] = [
  ...MASTER_SETS,
  ...MASTER_MINIFIGS,
  ...MASTER_MOCS,
  ...MASTER_CARDS
];

// ── 6. UTILITY QUERY ENGINE ──────────────────────────────────
export const legoDatabase = {
  getSets(): LegoSetItem[] {
    return MASTER_SETS;
  },

  getMinifigs(): MinifigureItem[] {
    return MASTER_MINIFIGS;
  },

  getMocs(): MocBuildItem[] {
    return MASTER_MOCS;
  },

  getCards(): CollectibleCardItem[] {
    return MASTER_CARDS;
  },

  getAll(): AnyCollectible[] {
    return ALL_COLLECTIBLES;
  },

  findById(idOrCode: string): AnyCollectible | undefined {
    if (!idOrCode) return undefined;
    const clean = idOrCode.trim().toLowerCase();
    return ALL_COLLECTIBLES.find(c => 
      c.id.toLowerCase() === clean ||
      c.code.toLowerCase() === clean ||
      c.code.toLowerCase().replace('-1', '') === clean.replace('-1', '')
    );
  },

  search(query: string, category?: CollectibleCategory | 'all'): AnyCollectible[] {
    if (!query && (!category || category === 'all')) return ALL_COLLECTIBLES;
    const q = (query || '').toLowerCase().trim();

    return ALL_COLLECTIBLES.filter(item => {
      const matchCategory = !category || category === 'all' || item.category === category;
      if (!matchCategory) return false;
      if (!q) return true;

      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  },

  getPriceHistory(code: string, months = 12): { date: string; sealed: number; used: number }[] {
    const item = this.findById(code);
    if (!item) {
      return Array.from({ length: months }, (_, i) => ({
        date: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
        sealed: 100 + i * 5,
        used: 70 + i * 3
      }));
    }

    const points = [];
    const now = new Date();
    const annualReturn = item.growth1Y / 100;
    const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;

    for (let i = months; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const monthsBack = i;
      const discount = Math.pow(1 + monthlyRate, -monthsBack);
      
      points.push({
        date: d.toISOString().split('T')[0],
        sealed: Math.round(item.sealedPrice * discount * 100) / 100,
        used: Math.round(item.usedPrice * discount * 100) / 100
      });
    }

    return points;
  }
};
