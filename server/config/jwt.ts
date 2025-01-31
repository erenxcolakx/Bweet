import jwt from 'jsonwebtoken';
import { Response } from 'express';
import logger from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRE = '24h';

export const generateToken = (user: any) => {
  return jwt.sign(
    { 
      user_id: user.user_id,
      email: user.email,
      name: user.name 
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRE }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return null;
  }
};

export const sendTokenResponse = (res: Response, user: any) => {
  const token = generateToken(user);
  
  res.status(200).json({
    success: true,
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      name: user.name
    }
  });
}; 