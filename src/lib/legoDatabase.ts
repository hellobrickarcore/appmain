// src/lib/legoDatabase.ts
// Master Collectibles Database (LEGO Sets, Minifigures, Pokémon TCG, Sports Cards, Magic, Lorcana, MOCs)

export type CollectibleCategory = 'set' | 'minifigure' | 'pokemon' | 'sports' | 'other_tcg' | 'moc';
export type InvestmentRating = 'Grail' | 'Blue Chip' | 'Strong Buy' | 'Hold' | 'Speculative';

export interface BaseCollectible {
  id: string;
  code: string; // setNum, figNum, or cardId
  name: string;
  theme: string;
  category: CollectibleCategory;
  year: number;
  retailPrice: number;
  sealedPrice: number; // For sets: Sealed MISB. For cards: Raw / Near Mint
  usedPrice: number;   // For sets: Used / Complete. For cards: Played / PSA 8
  psa10Value?: number; // For cards: PSA 10 Gem Mint
  psa9Value?: number;  // For cards: PSA 9 Mint
  growth1Y: number;    // % 1-Year growth
  growth30D: number;   // % 30-Day growth
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
}

export interface PokemonCardItem extends BaseCollectible {
  category: 'pokemon';
  cardNumber: string;
  setSeries: string;
  holoType: string;
}

export interface SportsCardItem extends BaseCollectible {
  category: 'sports';
  cardNumber: string;
  player: string;
  sport: 'Basketball' | 'Football' | 'Baseball' | 'Soccer';
  gradeManufacturer: 'PSA' | 'BGS' | 'SGC';
}

export interface OtherTcgItem extends BaseCollectible {
  category: 'other_tcg';
  game: 'Magic The Gathering' | 'Disney Lorcana' | 'One Piece' | 'Yu-Gi-Oh';
  cardNumber: string;
}

export interface MocBuildItem extends BaseCollectible {
  category: 'moc';
  pieceCount: number;
  matchPercentage: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  designer: string;
}

export type AnyCollectible = LegoSetItem | MinifigureItem | PokemonCardItem | SportsCardItem | OtherTcgItem | MocBuildItem;

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
  }
];

// ── 2. MASTER MINIFIGURES DATABASE ────────────────────────────
export const MASTER_MINIFIGS: MinifigureItem[] = [
  {
    id: 'fig-sw0107',
    code: 'sw0107',
    name: 'Boba Fett (Cloud City Printed Arms & Legs)',
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

// ── 3. MASTER POKÉMON TCG CARDS DATABASE ──────────────────────
export const MASTER_POKEMON: PokemonCardItem[] = [
  {
    id: 'pok-charizard-base',
    code: 'PKM-BASE-4',
    name: '1st Edition Shadowless Charizard Holo',
    theme: 'Pokémon Base Set',
    category: 'pokemon',
    year: 1999,
    retailPrice: 3.99,
    sealedPrice: 4500.00, // Raw Near Mint
    usedPrice: 1800.00,   // Played / Light Play
    psa10Value: 350000.00,
    psa9Value: 24000.00,
    growth1Y: 38.2,
    growth30D: 4.5,
    rarityScore: 10,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    cardNumber: '4/102',
    setSeries: 'Base Set 1st Edition',
    holoType: 'Galaxy Holofoil',
    isRetired: true,
    description: 'The pinnacle of trading card collectibles. The 1999 1st Edition Shadowless Charizard #4 with 100 Fire Spin Attack.'
  },
  {
    id: 'pok-moonbreon',
    code: 'PKM-EVO-215',
    name: 'Umbreon VMAX Alt Art (Moonbreon)',
    theme: 'Evolving Skies',
    category: 'pokemon',
    year: 2021,
    retailPrice: 4.49,
    sealedPrice: 850.00,
    usedPrice: 620.00,
    psa10Value: 1450.00,
    psa9Value: 890.00,
    growth1Y: 42.0,
    growth30D: 6.8,
    rarityScore: 9,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    cardNumber: '215/203',
    setSeries: 'Sword & Shield: Evolving Skies',
    holoType: 'Secret Rare Alternate Art',
    isRetired: true,
    description: 'The celebrated Moonbreon showing Umbreon reaching for the luminous moon. Modern TCG masterpiece.'
  },
  {
    id: 'pok-gengar-vmax',
    code: 'PKM-FUS-271',
    name: 'Gengar VMAX Alternate Art',
    theme: 'Fusion Strike',
    category: 'pokemon',
    year: 2021,
    retailPrice: 4.49,
    sealedPrice: 380.00,
    usedPrice: 260.00,
    psa10Value: 720.00,
    psa9Value: 450.00,
    growth1Y: 34.5,
    growth30D: 5.1,
    rarityScore: 9,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.pokemontcg.io/swsh8/271_hires.png',
    cardNumber: '271/264',
    setSeries: 'Sword & Shield: Fusion Strike',
    holoType: 'Secret Rare Alt Art',
    isRetired: true,
    description: 'Gigantamax Gengar swallowing entire buildings in vivid comic-book style artwork.'
  },
  {
    id: 'pok-rayquaza-vmax',
    code: 'PKM-EVO-218',
    name: 'Rayquaza VMAX Alt Art',
    theme: 'Evolving Skies',
    category: 'pokemon',
    year: 2021,
    retailPrice: 4.49,
    sealedPrice: 340.00,
    usedPrice: 240.00,
    psa10Value: 680.00,
    psa9Value: 420.00,
    growth1Y: 28.0,
    growth30D: 3.9,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.pokemontcg.io/swsh7/218_hires.png',
    cardNumber: '218/203',
    setSeries: 'Sword & Shield: Evolving Skies',
    holoType: 'Secret Rare Alt Art',
    isRetired: true,
    description: 'Emerald Sky Dragon Rayquaza soaring through celestial clouds with Zinnia.'
  },
  {
    id: 'pok-giratina-v',
    code: 'PKM-LOR-186',
    name: 'Giratina V Alternate Art',
    theme: 'Lost Origin',
    category: 'pokemon',
    year: 2022,
    retailPrice: 4.49,
    sealedPrice: 290.00,
    usedPrice: 210.00,
    psa10Value: 580.00,
    psa9Value: 360.00,
    growth1Y: 29.5,
    growth30D: 4.0,
    rarityScore: 8,
    demandScore: 9,
    rating: 'Strong Buy',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    cardNumber: '186/196',
    setSeries: 'Sword & Shield: Lost Origin',
    holoType: 'Ultra Rare Alt Art',
    isRetired: true,
    description: 'Mesmerizing distortion world artwork by Shinji Kanda depicting Giratina in the nether realm.'
  },
  {
    id: 'pok-shining-charizard',
    code: 'PKM-NEO-107',
    name: 'Shining Charizard 1st Edition',
    theme: 'Neo Destiny',
    category: 'pokemon',
    year: 2002,
    retailPrice: 3.99,
    sealedPrice: 950.00,
    usedPrice: 520.00,
    psa10Value: 3200.00,
    psa9Value: 1400.00,
    growth1Y: 22.0,
    growth30D: 2.8,
    rarityScore: 10,
    demandScore: 9,
    rating: 'Grail',
    imageUrl: 'https://images.pokemontcg.io/neo4/107_hires.png',
    cardNumber: '107/105',
    setSeries: 'Neo Destiny 1st Edition',
    holoType: 'Triple Star Shining Holo',
    isRetired: true,
    description: 'Iconic shiny Charizard printed with reflective silver foil body on midnight blue backdrop.'
  }
];

// ── 4. MASTER SPORTS & CORE CARDS DATABASE ────────────────────
export const MASTER_SPORTS: SportsCardItem[] = [
  {
    id: 'spt-jordan-1986',
    code: 'SPT-FLR-57',
    name: '1986 Fleer Michael Jordan Rookie Card #57',
    theme: 'Basketball Cards',
    category: 'sports',
    year: 1986,
    retailPrice: 0.35,
    sealedPrice: 3200.00, // Raw
    usedPrice: 1600.00,
    psa10Value: 180000.00,
    psa9Value: 18500.00,
    growth1Y: 21.5,
    growth30D: 3.2,
    rarityScore: 10,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/75192-1.jpg',
    cardNumber: '#57',
    player: 'Michael Jordan',
    sport: 'Basketball',
    gradeManufacturer: 'PSA',
    isRetired: true,
    description: 'The defining sports card of modern hobby history. Michael Jordan slam dunk rookie.'
  },
  {
    id: 'spt-lebron-2003',
    code: 'SPT-TOP-111',
    name: '2003 Topps Chrome LeBron James Rookie #111',
    theme: 'Basketball Cards',
    category: 'sports',
    year: 2003,
    retailPrice: 3.00,
    sealedPrice: 1400.00,
    usedPrice: 850.00,
    psa10Value: 12000.00,
    psa9Value: 3400.00,
    growth1Y: 18.0,
    growth30D: 2.1,
    rarityScore: 9,
    demandScore: 9,
    rating: 'Blue Chip',
    imageUrl: 'https://images.brickset.com/sets/images/10316-1.jpg',
    cardNumber: '#111',
    player: 'LeBron James',
    sport: 'Basketball',
    gradeManufacturer: 'PSA',
    isRetired: true,
    description: 'LeBron James Cleveland Cavaliers official Topps Chrome debut rookie card.'
  },
  {
    id: 'spt-brady-2000',
    code: 'SPT-PLY-144',
    name: '2000 Playoff Contenders Tom Brady Rookie Ticket Auto #144',
    theme: 'Football Cards',
    category: 'sports',
    year: 2000,
    retailPrice: 5.00,
    sealedPrice: 15000.00,
    usedPrice: 8500.00,
    psa10Value: 250000.00,
    psa9Value: 45000.00,
    growth1Y: 26.0,
    growth30D: 3.5,
    rarityScore: 10,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.brickset.com/sets/images/75252-1.jpg',
    cardNumber: '#144',
    player: 'Tom Brady',
    sport: 'Football',
    gradeManufacturer: 'PSA',
    isRetired: true,
    description: 'Autographed rookie card of the 7-time Super Bowl champion quarterback.'
  }
];

// ── 5. MASTER OTHER TCG (Lorcana, One Piece, Magic) ───────────
export const MASTER_OTHER_TCG: OtherTcgItem[] = [
  {
    id: 'tcg-lorcana-elsa',
    code: 'LOR-CHP1-207',
    name: 'Elsa - Spirit of Winter (Enchanted Foil)',
    theme: 'Disney Lorcana',
    category: 'other_tcg',
    year: 2023,
    retailPrice: 5.99,
    sealedPrice: 750.00,
    usedPrice: 480.00,
    psa10Value: 1400.00,
    psa9Value: 850.00,
    growth1Y: 55.0,
    growth30D: 8.2,
    rarityScore: 9,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.pokemontcg.io/sm5/151_hires.png',
    game: 'Disney Lorcana',
    cardNumber: '207/204',
    isRetired: true,
    description: 'Enchanted alternate art holofoil of Elsa from The First Chapter.'
  },
  {
    id: 'tcg-op-shanks',
    code: 'OP-ROM-120',
    name: 'Manga Shanks (Super Parallel SEC)',
    theme: 'One Piece TCG',
    category: 'other_tcg',
    year: 2022,
    retailPrice: 4.99,
    sealedPrice: 950.00,
    usedPrice: 680.00,
    psa10Value: 1650.00,
    psa9Value: 1100.00,
    growth1Y: 44.0,
    growth30D: 5.5,
    rarityScore: 9,
    demandScore: 10,
    rating: 'Grail',
    imageUrl: 'https://images.pokemontcg.io/sm9/165_hires.png',
    game: 'One Piece',
    cardNumber: 'OP01-120',
    isRetired: true,
    description: 'Manga background super parallel secret rare Red-Haired Shanks.'
  }
];

// ── 6. MASTER MOC BUILDS DATABASE ─────────────────────────────
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
  }
];

// ── 7. ALL COLLECTIBLES UNIFIED ───────────────────────────────
export const ALL_COLLECTIBLES: AnyCollectible[] = [
  ...MASTER_SETS,
  ...MASTER_MINIFIGS,
  ...MASTER_POKEMON,
  ...MASTER_SPORTS,
  ...MASTER_OTHER_TCG,
  ...MASTER_MOCS
];

// ── 8. UTILITY QUERY ENGINE ──────────────────────────────────
export const legoDatabase = {
  getSets(): LegoSetItem[] {
    return MASTER_SETS;
  },

  getMinifigs(): MinifigureItem[] {
    return MASTER_MINIFIGS;
  },

  getPokemon(): PokemonCardItem[] {
    return MASTER_POKEMON;
  },

  getSports(): SportsCardItem[] {
    return MASTER_SPORTS;
  },

  getOtherTcg(): OtherTcgItem[] {
    return MASTER_OTHER_TCG;
  },

  getMocs(): MocBuildItem[] {
    return MASTER_MOCS;
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
