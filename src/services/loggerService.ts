/**
 * Logger Service - Granular diagnostic tracking for HelloBrick
 * Used for "micro-logging" state transitions, errors, and performance metrics.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 500;

  constructor() {
    console.log('[Narrator:Logger] Diagnostic engine initialized.');
  }

  /**
   * Add a log entry
   */
  private addLog(level: LogLevel, category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };

    // Store in memory for retrieval
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Output to console with proper formatting
    const prefix = `[${category}]`;
    const consoleMsg = `${message}${data ? ' | Data: ' + JSON.stringify(data) : ''}`;

    switch (level) {
      case 'debug':
        if (import.meta.env.MODE === 'development') {
          console.debug(`%c${prefix} %c${consoleMsg}`, 'color: #94a3b8; font-weight: bold;', 'color: #64748b;');
        }
        break;
      case 'info':
        console.info(`%c${prefix} %c${consoleMsg}`, 'color: #3b82f6; font-weight: bold;', 'color: #1e293b;');
        break;
      case 'warn':
        console.warn(`%c${prefix} %c${consoleMsg}`, 'color: #f59e0b; font-weight: bold;', 'color: #78350f;');
        break;
      case 'error':
        console.error(`%c${prefix} %c${consoleMsg}`, 'color: #ef4444; font-weight: bold;', 'color: #7f1d1d;');
        break;
    }

    // Persistence to localStorage for post-crash analysis (last 50 logs)
    this.persistLogsShortTerm();
  }

  private persistLogsShortTerm() {
    try {
      const recentLogs = this.logs.slice(-50);
      localStorage.setItem('hellobrick_diagnostic_logs', JSON.stringify(recentLogs));
    } catch (e) {
      // Ignore storage errors (e.g. quota)
    }
  }

  // API
  debug(category: string, message: string, data?: any) { this.addLog('debug', category, message, data); }
  info(category: string, message: string, data?: any) { this.addLog('info', category, message, data); }
  warn(category: string, message: string, data?: any) { this.addLog('warn', category, message, data); }
  error(category: string, message: string, data?: any) { this.addLog('error', category, message, data); }

  /**
   * Retrieve current logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
    localStorage.removeItem('hellobrick_diagnostic_logs');
  }
}

export const logger = new LoggerService();
