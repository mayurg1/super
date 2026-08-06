export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export interface CreateLoggerOptions {
  namespace: string;
  level?: LogLevel;
  isDev?: boolean;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function createLogger(options: CreateLoggerOptions): Logger {
  const { namespace, level = 'info', isDev = false } = options;
  const minLevel = isDev ? 'debug' : level;

  function shouldLog(entryLevel: LogLevel): boolean {
    return LEVEL_ORDER[entryLevel] >= LEVEL_ORDER[minLevel];
  }

  function write(entryLevel: LogLevel, message: string, context?: LogContext): void {
    if (!shouldLog(entryLevel)) return;
    const prefix = `[${namespace}]`;
    const payload = context ? [prefix, message, context] : [prefix, message];
    switch (entryLevel) {
      case 'debug':
        console.debug(...payload);
        break;
      case 'info':
        console.info(...payload);
        break;
      case 'warn':
        console.warn(...payload);
        break;
      case 'error':
        console.error(...payload);
        break;
    }
  }

  return {
    debug: (message, context) => write('debug', message, context),
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
  };
}

export const rootLogger = createLogger({ namespace: 'supercampus', isDev: true });
