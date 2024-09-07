import { Request, Response, NextFunction } from 'express';
import * as authModel from '../model/model.js';
import { Session } from 'express-session';

interface CustomSession extends Session {
    user: {
      user_id: number;
      email: string;
    };
  }

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming the user is logged in and the user ID is stored in the session
    const userId = (req.session as CustomSession).user?.user_id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Fetch user profile from the database using the userId
    const user = await authModel.getUserById(userId); // Assuming getUserById exists in model.js

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send back the user profile data
    return res.status(200).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
  
    // Kullanıcının oturum bilgilerini session'dan alın
    const userId = (req.session as CustomSession).user?.user_id;
  
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
  
    try {
      // Veritabanında kullanıcının adını güncelle
      const result = await authModel.updateUserName(userId, name);
      
      if (result) {
        return res.status(200).json({ success: true, message: 'Profile updated successfully' });
      } else {
        return res.status(500).json({ success: false, message: 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };