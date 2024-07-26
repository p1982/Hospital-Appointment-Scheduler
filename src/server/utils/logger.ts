import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Init transports
const consoleTransport = new winston.transports.Console();
const fileErrorTransport = new winston.transports.File({
  filename: 'error.log',
  level: 'error',
});
const fileTransport = new winston.transports.File({ filename: 'combined.log' });

//formatter
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${
    typeof message === 'object' ? JSON.stringify(message) : message
  }`;
});

const myWinstonOptions = {
  format: combine(timestamp(), myFormat),
  transports: [consoleTransport, fileTransport, fileErrorTransport],
};
const logger = winston.createLogger(myWinstonOptions);

export function logRequest(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method}:${req.url}`);
  next();
}

export default logger;
