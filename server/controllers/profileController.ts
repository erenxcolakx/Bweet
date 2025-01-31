import { Request, Response, NextFunction } from 'express';
import * as authModel from '../model/model.js';
import { Session } from 'express-session';
import logger from '../config/logger';  // Import the logger

interface CustomSession extends Session {
    user: {
      user_id: number;
      email: string;
    };
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as CustomSession).user?.user_id;
    if (!userId) {
      logger.warn("Unauthorized access attempt to get profile");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const user = await authModel.getUserById(userId.toString());

    if (!user) {
      logger.warn(`User not found: userId = ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    logger.info(`Profile retrieved for userId: ${userId}`);
    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loggedUserId = (req.session as CustomSession).user?.user_id;
    if (!loggedUserId) {
      logger.warn("Unauthorized access attempt to get user info");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }
    const userId = req.params.id;

    const user = await authModel.getPublicUserInfosById(Number(userId));

    if (!user) {
      logger.warn(`User not found: userId = ${userId}`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    logger.info(`Public user info retrieved for userId: ${userId}`);
    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        posts: user.posts
      },
    });
  } catch (error) {
    logger.error(`Error fetching user info for userId: ${req.params.id}`, error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const userId = (req.session as CustomSession).user?.user_id;
  if (!userId) {
    logger.warn("Unauthorized access attempt to update profile");
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
  try {
    const result = await authModel.updateUserName(userId, name);
    if (result) {
      logger.info(`Profile updated successfully for userId: ${userId}`);
      return res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } else {
      logger.error(`Failed to update profile for userId: ${userId}`);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  } catch (error) {
    logger.error(`Error updating profile for userId: ${userId}`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
