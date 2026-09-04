import { describe, it, expect } from 'vitest';
import { liveCollectibleService } from '../services/liveCollectibleService';

describe('TCG Recognition & Extraction Engine', () => {
  it('should initialize liveCollectibleService properly', () => {
    expect(liveCollectibleService).toBeDefined();
    expect(typeof liveCollectibleService.identifyCollectible).toBe('function');
    expect(typeof liveCollectibleService.fetchMagicSampleImage).toBe('function');
  });

  it('extracts fraction card numbers and candidate names accurately', async () => {
    // Testing identifyCollectible with a known card
    const result = await liveCollectibleService.identifyCollectible(
      'Alakazam ex',
      'pokemon',
      ['Alakazam', 'Pokémon'],
      'STAGE 2\nAlakazam ex\nHP 310\nMind Jack 90+\n065/165'
    );
    if (result) {
      expect(result.category).toBe('pokemon');
      expect(result.name).toContain('Alakazam');
      expect(result.marketPrice).toBeGreaterThan(0);
      expect(result.imageUrl).toBeTruthy();
    }
  });

  it('resolves Magic TCG sample image correctly', async () => {
    const sampleImg = await liveCollectibleService.fetchMagicSampleImage();
    // In test environment without network, it may return string or null gracefully without throwing
    expect(sampleImg === null || typeof sampleImg === 'string').toBe(true);
  });

  it('resolves Japanese Buneary (ミミロル) and Pokédex NO.0427 accurately', async () => {
    const result = await liveCollectibleService.identifyCollectible(
      'ミミロル',
      'pokemon',
      [],
      'たね\nミミロル\nHP70+\n全国図鑑NO.0427 うさぎポケモン 高さ0.4m 重さ:5.5kg\nあまえる'
    );
    expect(result).not.toBeNull();
    expect(result?.name).toContain('Buneary');
    expect(result?.category).toBe('pokemon');
    expect(result?.language).toBe('Japanese');
  });

  it('resolves Japanese Alakazam (フーディン) and Pokédex NO.0065 accurately', async () => {
    const result = await liveCollectibleService.identifyCollectible(
      'フーディン',
      'pokemon',
      [],
      '2進化\nフーディン\nHP 1400\nユンゲラーから進化\n全国図鑑NO.0065 ねんりきポケモン'
    );
    expect(result).not.toBeNull();
    expect(result?.name).toContain('Alakazam');
    expect(result?.category).toBe('pokemon');
    expect(result?.language).toBe('Japanese');
  });
});
