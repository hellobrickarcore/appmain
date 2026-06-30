import type { LegoSet, SetValuation, PricePoint } from "@/types";
import { generatePriceHistory } from "./utils";

const REBRICKABLE_BASE_URL = "https://rebrickable.com/api/v3/lego";
const API_KEY = process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY || "";

/**
 * Interface representing raw Rebrickable API set results
 */
interface RebrickableSetRaw {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string | null;
}

/**
 * Fetch theme name by theme_id from Rebrickable
 */
export async function getThemeName(themeId: number): Promise<string> {
  if (!API_KEY) return "Creator Expert"; // Fallback if no key

  try {
    const res = await fetch(
      `${REBRICKABLE_BASE_URL}/themes/${themeId}/?key=${API_KEY}`,
      { next: { revalidate: 86400 } } // Cache theme for 24h
    );

    if (!res.ok) throw new Error("Failed to fetch theme");
    const data = await res.json();
    return data.name;
  } catch (err) {
    console.warn(`Could not resolve theme ID ${themeId}:`, err);
    return "Lego Sets";
  }
}

/**
 * Helper to estimate retail price and valuation from basic set parameters
 * (Used to generate realistic asset tracking data for any live searched set)
 */
export function generateSyntheticValuation(
  setNum: string,
  year: number,
  numParts: number
): { retailPrice: number; valuation: SetValuation } {
  // Estimate retail price at $0.10 per part (classic Lego rule)
  const retailPrice = Math.max(9.99, Math.round(numParts * 0.10 * 100) / 100);

  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - year);
  const isRetired = age >= 3; // Est. retirement after 3 years

  let sealedMultiplier = 1.0;
  let trend: "up" | "down" | "stable" = "stable";

  if (isRetired) {
    // Retired sets appreciate based on age & parts count (rarity)
    sealedMultiplier = 1.2 + (age * 0.08) + (numParts > 1000 ? 0.25 : 0);
    trend = "up";
  } else {
    // Active sets sit around retail or slight discount
    sealedMultiplier = 0.95 + (Math.random() * 0.1);
    trend = Math.random() > 0.6 ? "up" : "stable";
  }

  const sealedValue = Math.round(retailPrice * sealedMultiplier * 100) / 100;
  const usedValue = Math.round(sealedValue * 0.68 * 100) / 100; // used ≈ 68% of sealed
  const resaleAvg = Math.round(((sealedValue + usedValue) / 2) * 100) / 100;

  // Percentage changes
  const sealedChange24h = trend === "up" ? Math.random() * 1.5 : (Math.random() - 0.5) * 0.8;
  const usedChange24h = sealedChange24h * 0.8;
  const sealedChange7d = sealedChange24h * 4.5;
  const usedChange7d = usedChange24h * 4.2;
  const sealedChange30d = sealedChange7d * 3.2;
  const usedChange30d = usedChange7d * 3.0;

  // Rarity and Demand ratings
  const rarityScore = Math.min(10, Math.max(1, isRetired ? Math.floor(3 + age * 0.5) : Math.floor(1 + Math.random() * 3)));
  const demandScore = Math.min(10, Math.max(1, Math.floor(4 + Math.random() * 5)));

  // Generate 12-month historical price points
  const priceHistory = generatePriceHistory(retailPrice, 12, trend);

  const valuation: SetValuation = {
    setNum,
    sealedValue,
    usedValue,
    resaleAvg,
    sealedChange24h: Math.round(sealedChange24h * 100) / 100,
    usedChange24h: Math.round(usedChange24h * 100) / 100,
    sealedChange7d: Math.round(sealedChange7d * 100) / 100,
    usedChange7d: Math.round(usedChange7d * 100) / 100,
    sealedChange30d: Math.round(sealedChange30d * 100) / 100,
    usedChange30d: Math.round(usedChange30d * 100) / 100,
    rarityScore,
    demandScore,
    priceHistory,
    lastUpdated: new Date().toISOString(),
  };

  return { retailPrice, valuation };
}

/**
 * Intelligent local simulated set generator when no Rebrickable API key is present.
 * Deduces realistic LEGO themes, names, part counts, and valuations from set numbers!
 */
export function createLocalSyntheticSet(setNum: string): { set: LegoSet; valuation: SetValuation } {
  // Extract numerical set identifier
  const cleanNum = setNum.replace(/[^0-9]/g, "");
  const numVal = parseInt(cleanNum) || 10270;
  
  let theme = "Creator Expert";
  let name = `Collector Set #${cleanNum}`;
  let numParts = 1250;
  let year = 2021;

  // Deduce patterns matching actual LEGO product ranges
  if (numVal >= 75000 && numVal <= 75999) {
    theme = "Star Wars";
    name = `Galactic Starfighter #${cleanNum}`;
    numParts = 1450 + (numVal % 1500);
    year = 2017 + (numVal % 8);
  } else if (numVal >= 42000 && numVal <= 42199) {
    theme = "Technic";
    name = `Supercar Concept #${cleanNum}`;
    numParts = 1800 + (numVal % 2000);
    year = 2018 + (numVal % 7);
  } else if (numVal >= 71000 && numVal <= 71999) {
    theme = "Harry Potter";
    name = `Wizarding Castle Module #${cleanNum}`;
    numParts = 1100 + (numVal % 1200);
    year = 2019 + (numVal % 6);
  } else if (numVal >= 21000 && numVal <= 21399) {
    theme = "Ideas";
    name = `Showcase Modular Model #${cleanNum}`;
    numParts = 850 + (numVal % 1200);
    year = 2016 + (numVal % 9);
  } else if (numVal >= 10000 && numVal <= 10299) {
    theme = "Icons";
    name = `Advanced Architecture #${cleanNum}`;
    numParts = 2000 + (numVal % 4000);
    year = 2015 + (numVal % 10);
  } else {
    const themes = ["Architecture", "Icons", "Super Heroes", "Space Shuttle", "Creator Expert"];
    theme = themes[numVal % themes.length];
    name = `Special Edition Set #${cleanNum}`;
    numParts = 600 + (numVal % 2000);
    year = 2014 + (numVal % 12);
  }

  const { retailPrice, valuation } = generateSyntheticValuation(setNum, year, numParts);

  const set: LegoSet = {
    id: setNum,
    setNum: setNum,
    name: name,
    year: year,
    theme: theme,
    themeId: numVal % 1000,
    numParts: numParts,
    imageUrl: `https://cdn.rebrickable.com/media/sets/${setNum}.jpg`, // Standard Rebrickable CDN format
    retailPrice: retailPrice,
    isRetired: new Date().getFullYear() - year >= 3,
  };

  return { set, valuation };
}

/**
 * Live search LEGO sets using Rebrickable API
 */
export async function searchRebrickableSets(query: string): Promise<LegoSet[]> {
  if (!API_KEY) {
    // 100% Offline Simulator: generate search match on the fly if search query is a number
    const cleanQ = query.replace(/[^0-9]/g, "");
    if (cleanQ.length >= 4) {
      const synthetic = createLocalSyntheticSet(query.trim());
      return [synthetic.set];
    }
    return [];
  }

  try {
    const res = await fetch(
      `${REBRICKABLE_BASE_URL}/sets/?search=${encodeURIComponent(query)}&key=${API_KEY}`
    );

    if (!res.ok) throw new Error(`Rebrickable API returned code ${res.status}`);
    const data = await res.json();

    if (!data.results) return [];

    const sets: LegoSet[] = [];
    
    // Process top 8 results in parallel
    const rawSets = data.results.slice(0, 8) as RebrickableSetRaw[];
    
    for (const raw of rawSets) {
      const theme = await getThemeName(raw.theme_id);
      const age = new Date().getFullYear() - raw.year;
      const { retailPrice } = generateSyntheticValuation(raw.set_num, raw.year, raw.num_parts);

      sets.push({
        id: raw.set_num,
        setNum: raw.set_num,
        name: raw.name,
        year: raw.year,
        theme,
        themeId: raw.theme_id,
        numParts: raw.num_parts,
        imageUrl: raw.set_img_url || `https://cdn.rebrickable.com/media/sets/${raw.set_num}.jpg`,
        retailPrice,
        isRetired: age >= 3,
      });
    }

    return sets;
  } catch (err) {
    console.error("Error searching Rebrickable:", err);
    return [];
  }
}

/**
 * Live fetch a single LEGO set's details using Rebrickable API
 */
export async function fetchRebrickableSetDetails(
  setNum: string
): Promise<{ set: LegoSet; valuation: SetValuation } | null> {
  if (!API_KEY) {
    // Return simulated offline set details instantly
    return createLocalSyntheticSet(setNum);
  }

  try {
    const res = await fetch(
      `${REBRICKABLE_BASE_URL}/sets/${setNum}/?key=${API_KEY}`
    );

    if (!res.ok) return null;
    const raw = (await res.json()) as RebrickableSetRaw;

    const theme = await getThemeName(raw.theme_id);
    const { retailPrice, valuation } = generateSyntheticValuation(raw.set_num, raw.year, raw.num_parts);
    const currentYear = new Date().getFullYear();

    const set: LegoSet = {
      id: raw.set_num,
      setNum: raw.set_num,
      name: raw.name,
      year: raw.year,
      theme,
      themeId: raw.theme_id,
      numParts: raw.num_parts,
      imageUrl: raw.set_img_url || `https://cdn.rebrickable.com/media/sets/${raw.set_num}.jpg`,
      retailPrice,
      isRetired: currentYear - raw.year >= 3,
    };

    return { set, valuation };
  } catch (err) {
    console.error(`Error loading details for set ${setNum}:`, err);
    return null;
  }
}

