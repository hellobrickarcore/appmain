import { Brick } from '../../types';

export interface NormalizedVault {
  totalBricks: number;
  countsBySize: Record<string, number>;
  countsByColor: Record<string, number>;
  countsByCategory: Record<string, number>;
  items: NormalizedBrick[];
}

export interface NormalizedBrick {
  id: string;
  sizeLabel: string;
  colorLabel: string;
  category: string;
  quantity: number;
}

/**
 * GROUNDED VAULT NORMALIZATION
 * Cleans up messy scanner labels into structured building blocks.
 */
export const normalizeVault = (bricks: Brick[] | any[]): NormalizedVault => {
  const norm: NormalizedVault = {
    totalBricks: 0,
    countsBySize: {},
    countsByColor: {},
    countsByCategory: {},
    items: []
  };

  bricks.forEach(b => {
    const rawLabel = (b.name || b.label || '').toLowerCase();
    
    // Extraction Regexes
    const sizeMatch = rawLabel.match(/(\d+\s*x\s*\d+)/);
    const colorMatch = rawLabel.match(/(red|blue|yellow|green|white|black|orange|gray|grey|brown|tan|lime|pink|purple)/i);
    
    const size = sizeMatch ? sizeMatch[1].replace(/\s/g, '') : 'Unknown';
    const color = colorMatch ? colorMatch[0].charAt(0).toUpperCase() + colorMatch[0].slice(1) : (b.color || 'Unknown');
    
    let category = 'Brick';
    if (rawLabel.includes('plate')) category = 'Plate';
    else if (rawLabel.includes('tile')) category = 'Tile';
    else if (rawLabel.includes('slope')) category = 'Slope';
    else if (rawLabel.includes('technic')) category = 'Technic';

    const normalized: NormalizedBrick = {
      id: b.id || Math.random().toString(36).substr(2, 9),
      sizeLabel: size,
      colorLabel: color,
      category: category,
      quantity: b.count || 1
    };

    norm.items.push(normalized);
    norm.totalBricks += normalized.quantity;

    // Aggregates
    if (normalized.sizeLabel !== 'Unknown') {
      norm.countsBySize[normalized.sizeLabel] = (norm.countsBySize[normalized.sizeLabel] || 0) + normalized.quantity;
    }
    if (normalized.colorLabel !== 'Unknown') {
      norm.countsByColor[normalized.colorLabel] = (norm.countsByColor[normalized.colorLabel] || 0) + normalized.quantity;
    }
    norm.countsByCategory[normalized.category] = (norm.countsByCategory[normalized.category] || 0) + normalized.quantity;
  });

  return norm;
};
