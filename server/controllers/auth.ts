import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import * as authModel from '../model/model.js';
import * as emailModel from '../model/mailModel.js';
import { sendVerificationEmail, generateVerificationToken } from '../model/mailModel.js';
import { Session } from 'express-session';
import passport from "passport";
import logger from '../config/logger';

const saltRounds = 10;

// Custom session interface
interface CustomSession extends Session {
  user: {
    user_id: number;
    email: string;
    name: string;
  };
}


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

            logger.info(`Login attempt for unverified user: ${user.email}`);
            return res.status(403).json({
              success: false,
              message: "Your email is not verified. A new verification email has been sent."
            });
          }

          (req.session as CustomSession).user = { user_id: user.user_id, email: user.email, name: user.name };
          req.session.save((err) => {
            if (err) {
              logger.error(`Session save error for user ${user.email}: ${err.message}`);
              return res.status(500).json({ success: false, message: "Session save error" });
            }
            logger.info(`User ${user.email} logged in successfully`);
            res.status(200).json({ success: true, message: "Login successful", user: { email: user.email, user_id: user.user_id, name: user.name } });
          });
        } else {
          logger.warn(`Incorrect password attempt for user: ${user.email}`);
          res.status(500).json({ success: false, message: "Incorrect password" });
        }
      } else {
        logger.warn(`Password not found for user: ${user.email}`);
        res.status(401).json({ success: false, message: "Incorrect password" });
      }
    } else {
      logger.warn(`User not found with email: ${email}`);
      res.status(404).json({ success: false, message: "User not found. You can create new account" });
    }
  } catch (err) {
    logger.error(`Login error for email ${email}: ${err}`);
    res.status(500).json({ success: false, message: "Internal server error" });
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
export const handleLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err: Error) => {
    if (err) {
      logger.error(`Error destroying session: ${err}`);
      res.status(500).json({ success: false, message: "Error destroying session" });
    } else {
      logger.info('User logged out successfully');
      res.status(200).json({ success: true, message: "Logout successful" });
    }
  });
};

// Handle account deletion
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as CustomSession).user.user_id; // Get the user ID from the session

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


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() || req.session && (req.session as CustomSession).user) {
    logger.info(`User is authenticated: ${req.session}`);
    return next();
  }
  logger.warn('Unauthorized access attempt');
  res.status(401).json({ success: false, message: "You must be logged in to view this page" });
};


// Check Auth
export const checkAuth = (req: Request, res: Response) => {
  const user = (req.session as CustomSession)?.user;
  if (user && user.user_id) {
    logger.info(`User is authenticated: ${user.email}`);
    res.status(200).json({ success: true, user });
  } else {
    logger.warn('Check auth failed. User not authenticated');
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};


// Google OAuth yönlendirmesi
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback
export const googleCallback = (req: Request, res: Response) => {
  if (!req.user) {
    logger.error('Google authentication failed');
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
  const user = req.user as { user_id: number; email: string; name: string };
  (req.session as CustomSession).user = { user_id: user.user_id, email: user.email, name: user.name };
  req.session.save((err) => {
    if (err) {
      logger.error(`Session save error after Google login for user: ${user.email}`);
      return res.status(500).json({ success: false, message: "Session save error" });
    }
    logger.info(`User logged in via Google: ${user.email}`);
    res.redirect('http://localhost:3000/home');
  });
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