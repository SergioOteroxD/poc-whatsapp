/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DateUtils } from './date.utils';

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  ERROR = 'ERROR',
  OFF = 'OFF',
}

enum LogFormat {
  TEXT = 'text',
  JSON = 'json',
}

export class CustomLogger {
  private static instance: CustomLogger;
  private traceId: string;
  private logLevel: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  private logFormat: LogFormat =
    (process.env.LOG_FORMAT as LogFormat) || LogFormat.TEXT;

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  public static getInstance(): CustomLogger {
    if (!CustomLogger.instance) {
      CustomLogger.instance = new CustomLogger();
    }
    return CustomLogger.instance;
  }

  public setTracerLog(options: {
    traceId: string;
    requestData: any;
    requestMetada: any;
  }) {
    this.traceId = options?.traceId;
    const logEntry = {
      timestamp: DateUtils.getDate({ date: new Date().toISOString() }),
      traceId: options?.traceId,
      level: LogLevel.INFO,
      message: `Start request execution with log level `,
      data: {
        request: options?.requestData,
        requestMetada: options?.requestMetada,
      },
      trace: this.getCaller(),
    };

    console.info(this.getLogText(logEntry));
  }

  info(message: string, data?: any, tags?: string[]): void {
    this.writeLog(LogLevel.INFO, message, data, tags);
  }

  error(message: string, data?: any, tags?: string[]): void {
    this.writeLog(LogLevel.ERROR, message, data, tags);
  }

  debug(message: string, data?: any, tags?: string[]): void {
    this.writeLog(LogLevel.DEBUG, message, data, tags);
  }

  private writeLog(
    level: LogLevel,
    message: string,
    data?: any,
    tags?: string[],
  ): void {
    if (this.shouldLog(level)) {
      const logEntry = {
        timestamp: DateUtils.getDate({ date: new Date().toISOString() }),
        traceId: this.traceId,
        level,
        message,
        data,
        trace: this.getCaller(),
        tags,
      };

      console.log(this.getLogText(logEntry));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return (
      Object.values(LogLevel).indexOf(level) >=
      Object.values(LogLevel).indexOf(this.logLevel)
    );
  }

  private getCaller(): string {
    try {
      throw new Error();
    } catch (e) {
      const stackLines = e.stack?.split('\n');
      if (stackLines && stackLines.length >= 4) {
        const trace = stackLines[4]?.replaceAll(')', '')?.split('\\');
        if (trace && trace.length > 1) {
          return trace[trace?.length - 1];
        }
      }
    }
    return '';
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return `\x1b[34m${level}\x1b[0m`; // Azul
      case LogLevel.INFO:
        return `\x1b[32m${level}\x1b[0m`; // Verde
      case LogLevel.ERROR:
        return `\x1b[31m${level}\x1b[0m`; // Rojo
      default:
        return level; // Sin color
    }
  }

  private getLogText(logEntry: any): string {
    if (this.logFormat === LogFormat.JSON) {
      return JSON.stringify(logEntry);
    } else {
      return `${logEntry.timestamp} ${logEntry.traceId} [${this.getColorForLevel(logEntry.level)}] - ${
        logEntry.message
      } - ${logEntry.trace}
      ${logEntry.tags ? '- [' + logEntry.tags + ']' : ''} ${
        logEntry.data ? '-> ' + JSON.stringify(logEntry.data) : ''
      }`;
    }
  }
}
