import Pino from 'pino';

export const logger = Pino({
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level(_label, number) {
      /**
       * Convert to Stackdriver compatible severity levels.
       */
      switch (number) {
        case 10:
        case 20:
          return { severity: 'DEBUG' };
        case 30:
          return { severity: 'INFO' };
        case 40:
          return { severity: 'WARNING' };
        case 50:
          return { severity: 'ERROR' };
        case 60:
          return { severity: 'CRITICAL' };
        default:
          return { severity: 'INFO' };
      }
    }
  }
});

export default logger;
