import { NormalizedBrick, normalizeVaultBrick } from './normalizeVaultBrick';

export interface DetailedVaultSummary {
  totalBricks: number;
  countsBySize: Record<string, number>;
  countsByColor: Record<string, number>;
  countsByCategory: Record<string, number>;
  strongestProfiles: {
    stacking: number;
    creature: number;
    vehicle: number;
    tower: number;
    microBuild: number;
  };
}

export function generatevaultSummary(bricks: any[]): DetailedVaultSummary {
  const normalized = bricks.map(normalizeVaultBrick);
  
  const summary: DetailedVaultSummary = {
    totalBricks: 0,
    countsBySize: {},
    countsByColor: {},
    countsByCategory: {},
    strongestProfiles: {
      stacking: 0,
      creature: 0,
      vehicle: 0,
      tower: 0,
      microBuild: 0
    }
  };

  normalized.forEach(b => {
    summary.totalBricks += b.count;
    
    if (b.sizeLabel !== "Unknown") {
      summary.countsBySize[b.sizeLabel] = (summary.countsBySize[b.sizeLabel] || 0) + b.count;
    }
    
    if (b.colorLabel !== "Unknown") {
      summary.countsByColor[b.colorLabel] = (summary.countsByColor[b.colorLabel] || 0) + b.count;
    }
    
    summary.countsByCategory[b.category] = (summary.countsByCategory[b.category] || 0) + b.count;
  });

  // Calculate Heuristics (0 to 1)
  const bricksCount = summary.countsByCategory["brick"] || 0;
  const platesCount = summary.countsByCategory["plate"] || 0;
  const technicCount = summary.countsByCategory["technic"] || 0;
  const total = summary.totalBricks || 1;

  summary.strongestProfiles.stacking = Math.min(1, (bricksCount * 1.5 + platesCount) / total);
  summary.strongestProfiles.tower = summary.strongestProfiles.stacking * 0.9;
  summary.strongestProfiles.microBuild = Math.min(1, (platesCount * 2 + (summary.countsByCategory["round"] || 0) * 3) / total);
  summary.strongestProfiles.creature = Math.min(1, (summary.countsBySize["1x1"] || 0) > 2 ? 0.7 : 0.3);
  summary.strongestProfiles.vehicle = Math.min(1, (technicCount * 2 + (summary.countsBySize["2x4"] || 0)) / total);

  return summary;
}
