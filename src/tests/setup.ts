import { vi } from 'vitest';

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock video element behavior if needed
// JSDOM usually handles basic element creation but not play/pause
window.HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLVideoElement.prototype.pause = vi.fn();
window.HTMLVideoElement.prototype.load = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
  root: null,
  rootMargin: '0px',
  thresholds: [0],
})) as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof ResizeObserver;
