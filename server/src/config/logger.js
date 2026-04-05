import winston from "winston"

// Create the logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const originalEnd = res.end;
  const startTime = Date.now();
  
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    const logMessage = `${req.method} ${req.originalUrl || req.url} - Status: ${res.statusCode} - ${responseTime}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(logMessage);
    } else {
      logger.info(logMessage);
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
};

export { logger, requestLogger };