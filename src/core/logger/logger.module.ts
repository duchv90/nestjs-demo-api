import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `[${timestamp}] ${level.toUpperCase()}: ${context ? `[${context}] ` : ''}${message}`;
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYYMMDDHH',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYYMMDDHH',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format((info) => {
              return info.level === 'error' ? info : false;
            })(),
            winston.format.json(),
          ),
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/info-%DATE%.log',
          datePattern: 'YYYYMMDDHH',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format((info) => {
              return info.level === 'info' ? info : false;
            })(),
            winston.format.json(),
          ),
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    }),
  ],
  providers: [],
  exports: [WinstonModule],
})
export class LoggerModule {}
