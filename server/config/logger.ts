import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Set log level (e.g., info, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
