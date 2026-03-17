
export const usageService = {
  getDailyScanCount(): number {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
    const stored = localStorage.getItem(`hellobrick_scans_${today}`);
    return stored ? parseInt(stored, 10) : 0;
  },

  incrementScanCount(): void {
    const today = new Date().toISOString().split('T')[0];
    const current = this.getDailyScanCount();
    localStorage.setItem(`hellobrick_scans_${today}`, (current + 1).toString());
    
    // Cleanup old keys (optional but good practice)
    this.cleanupOldLogs(today);
  },

  isLimitReached(): boolean {
    // Pro users have no limit
    const isPro = localStorage.getItem('hellobrick_is_pro') === 'true' || localStorage.getItem('hellobrick_dev_mode') === 'true';
    if (isPro) return false;

    return this.getDailyScanCount() >= 10;
  },

  cleanupOldLogs(currentDate: string): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('hellobrick_scans_') && key !== `hellobrick_scans_${currentDate}`) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to cleanup usage logs:', e);
    }
  }
};
