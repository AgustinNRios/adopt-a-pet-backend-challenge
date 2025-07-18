import winston from 'winston';

declare module 'winston' {
  interface Logger {
    fatal: winston.LeveledLogMethod;
  }
}
