import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const checkSessionHealth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    // Refresh the session
    req.session.touch();
    
    // Log session details for debugging
    logger.debug('Session health check:', {
      id: req.sessionID,
      cookie: req.session.cookie,
      user: req.session.user.email
    });
  }
  next();
}; 