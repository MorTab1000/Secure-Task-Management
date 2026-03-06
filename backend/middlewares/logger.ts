import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, '../log.txt');

const logger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const body = req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : 'N/A';

  const logEntry = `[${timestamp}] ${method} ${url} | Body: ${body}\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error('Failed to write to log.txt:', err);
  });

  next();
};

export default logger;
