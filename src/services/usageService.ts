export const usageService = {
  getDailyScanCount(): number {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
    const stored = localStorage.getItem(`hellobrick_scans_${today}`);
    return stored ? parseInt(stored, 10) : 0;
  },

  getLifetimeScanCount(): number {
    const stored = localStorage.getItem('hellobrick_scans_total');
    return stored ? parseInt(stored, 10) : 0;
  },

  incrementScanCount(): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Increment daily
    const currentDaily = this.getDailyScanCount();
    localStorage.setItem(`hellobrick_scans_${today}`, (currentDaily + 1).toString());
    
    // Increment total (lifetime)
    const currentTotal = this.getLifetimeScanCount();
    localStorage.setItem('hellobrick_scans_total', (currentTotal + 1).toString());
    
    // Cleanup old keys (optional but good practice)
    this.cleanupOldLogs(today);
  },

  isLimitReached(): boolean {
    return false; // DISABLED for 'No Sign-Up First' strategy
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
