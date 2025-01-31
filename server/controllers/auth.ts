import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import * as authModel from '../model/model.js';
import * as emailModel from '../model/mailModel.js';
import { sendVerificationEmail, generateVerificationToken } from '../model/mailModel.js';
import { Session } from 'express-session';
import passport from "passport";
import logger from '../config/logger';
import { generateToken, verifyToken } from '../config/jwt';

declare module 'express-session' {
  interface SessionData {
    user: {
      user_id: string;
      email: string;
      name: string;
    };
  }
}

const saltRounds = 10;

export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.username;
  const loginPassword = req.body.password;

  try {
    const result = await authModel.getUserByEmail(email);
    if (result) {
      const user = result;
      const storedHashedPassword = user.password;
      
      if (storedHashedPassword) {
        const isMatch = await bcrypt.compare(loginPassword, storedHashedPassword);
        if (isMatch) {
          if (!user.is_verified) {
            const token = generateVerificationToken(user.user_id);
            sendVerificationEmail(user.email, token);
            return res.status(403).json({
              success: false,
              message: "Your email is not verified. A new verification email has been sent."
            });
          }

          // Set session data
          req.session.user = {
            user_id: user.user_id.toString(),
            email: user.email,
            name: user.name
          };

          // Save session explicitly
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                logger.error(`Session save error during login for user: ${email}: ${err}`);
                reject(err);
              } else {
                resolve();
              }
            });
          });

          logger.info(`User ${user.email} logged in successfully`);
          return res.status(200).json({ 
            success: true, 
            user: { 
              user_id: user.user_id, 
              email: user.email, 
              name: user.name 
            } 
          });
        }
      }
    }
    
    logger.warn(`Failed login attempt for email: ${email}`);
    return res.status(401).json({ success: false, message: "Invalid credentials" });
    
  } catch (error) {
    logger.error(`Login error for email ${email}: ${error}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

  // Handle register
  export const handleRegister = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.username;
    const password = req.body.password;
  
    try {
      const user = await authModel.getUserByEmail(email);
      if (user) {
        logger.warn(`Registration attempt for existing email: ${email}`);
        res.status(409).json({ success: false, message: 'Email already exists. Try logging in.' });
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            logger.error(`Error hashing password for email ${email}: ${err}`);
            res.status(500).json({ success: false, message: 'Internal server error' });
          } else {
            const newUser = await authModel.createUser(email, hash);
            const token = emailModel.generateVerificationToken(newUser.user_id);
            emailModel.sendVerificationEmail(newUser.email, token);
            logger.info(`User registered successfully: ${newUser.email}`);
            res.status(201).json({ success: true, message: 'Registration successful. Please check your email to verify your account.' });
          }
        });
      }
    } catch (error) {
      logger.error(`Registration error for email ${email}: ${error}`);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

// Email Verification Handler
export const handleEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token as string;
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    logger.error("JWT_SECRET environment variable is not defined");
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  try {
    const decoded = jwt.verify(token, secretKey) as { userId: number };
    const userId = decoded.userId;
    await authModel.verifyUser(userId);
    logger.info(`User ${userId} verified their email successfully`);
    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    logger.error(`Invalid or expired token for email verification: ${error}`);
    res.status(400).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Handle logout
export const handleLogout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      
      res.clearCookie('connect.sid');
      logger.info('User logged out successfully');
      res.status(200).json({ success: true, message: "Logout successful" });
    });
  } else {
    logger.warn('No session to destroy during logout');
    res.status(200).json({ success: true, message: "Already logged out" });
  }
};

// Handle account deletion
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user?.user_id;

    if (!userId) {
      logger.warn('Unauthorized account deletion attempt');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Call model function to delete the user
    await authModel.deleteUserById(userId);

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Failed to destroy session after deleting user: ${userId}`);
        return res.status(500).json({ success: false, message: 'Failed to delete account' });
      }
      logger.info(`User account deleted successfully: ${userId}`);
      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (error) {
    logger.error(`Error deleting account for user ${req.session}: ${error}`);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Check Auth middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('No token provided');
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    logger.warn('Invalid token');
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  req.user = decoded;
  next();
};

// Check Auth endpoint
export const checkAuth = (req: Request, res: Response) => {
  if (!req.session || !req.session.user) {
    logger.warn('Check auth failed: No session');
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const user = req.session.user;
  
  if (user?.user_id) {
    logger.info(`User is authenticated: ${user.email}`);
    // Touch the session to keep it alive
    req.session.touch();
    return res.status(200).json({ success: true, user });
  }

  logger.warn('Check auth failed: Invalid user data');
  return res.status(401).json({ success: false, message: "Not authenticated" });
};

// Google OAuth yönlendirmesi
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });
// Google OAuth callback
export const googleCallback = (req: Request, res: Response) => {
  if (!req.user) {
    logger.error('Google authentication failed - No user data');
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }

  const user = req.user as { user_id: string; email: string; name: string };
  const token = generateToken(user);
  
  res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
};

// Logout for OAuth or normal logouts
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      logger.error('Error during logout:', err);
      return res.status(500).send('Logout failed');
    }
    logger.info(`User logged out successfully via OAuth: ${req.session}`);
    res.status(200).json({ success: true, message: "Logout successful" });
  });
};