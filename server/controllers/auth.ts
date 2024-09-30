import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import * as authModel from '../model/model.js';
import * as emailModel from '../model/mailModel.js';
import { sendVerificationEmail, generateVerificationToken } from '../model/mailModel.js';
import { Session } from 'express-session';
import passport from "passport";

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
      // Şifre doğrulama
      if (storedHashedPassword) {
        const isMatch = await bcrypt.compare(loginPassword, storedHashedPassword);
        if (isMatch) {
          // Kullanıcının doğrulanıp doğrulanmadığını kontrol et
          if (!user.is_verified) {
            // Kullanıcı doğrulanmamış, doğrulama e-postasını yeniden gönder
            const token = generateVerificationToken(user.user_id);
            sendVerificationEmail(user.email, token);

            return res.status(403).json({
              success: false,
              message: "Your email is not verified. A new verification email has been sent."
            });
          }

          // Kullanıcı doğrulanmışsa oturum aç
          (req.session as CustomSession).user = { user_id: user.user_id, email: user.email, name: user.name};
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ success: false, message: "Session save error" });
            }
            console.log("Session save success");
            res.status(200).json({ success: true, message: "Login successful", user: { email: user.email, user_id: user.user_id, name: user.name } });
          });
        } else {
          res.status(500).json({ success: false, message: "Incorrect password" });
        }
      } else {
        res.status(401).json({ success: false, message: "Incorrect password" });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found. You can create new account" });
    }
  } catch (err) {
    console.log(err);
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
        res.status(409).json({ success: false, message: 'Email already exists. Try logging in.' });
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.log("Error hashing password", err);
            res.status(500).json({ success: false, message: 'Internal server error' });
          } else {
            const newUser = await authModel.createUser(email, hash);
            const token = emailModel.generateVerificationToken(newUser.user_id);
            emailModel.sendVerificationEmail(newUser.email, token);
            res.status(201).json({ success: true, message: 'Registration successful. Please check your email to verify your account.' });
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  export const handleEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    try {
      const decoded = jwt.verify(token, secretKey) as { userId: number }; // Token'ı çözümlüyoruz
      const userId = decoded.userId;
      // Kullanıcıyı veritabanında doğrulanmış olarak işaretle
      await authModel.verifyUser(userId); // `verifyUser` adında bir fonksiyon olmalı
      res.status(200).json({ success: true, message: 'Email verified successfully!' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
  };

// Handle logout
export const handleLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err: Error) => {
      if (err) {
          console.log("Error destroying session: " + err);
          res.status(500).json({ success: false, message: "Error destroying session" });
      } else {
          res.status(200).json({ success: true, message: "Logout successful" });
      }
  });
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as CustomSession).user.user_id; // Get the user ID from the session

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Call model function to delete the user
    await authModel.deleteUserById(userId);

    // Destroy session after deletion
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete account' });
      }
      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() || req.session && (req.session as CustomSession).user) {  // Passport.js'in oturum doğrulama fonksiyonu
    console.log("Session in isAuthenticated:", req.session);
    return next();  // Eğer kullanıcı oturum açtıysa, sonraki middleware'e devam et
  }

  console.log("You must be logged in to view this page");
  res.status(401).json({ success: false, message: "You must be logged in to view this page" });
};


export const checkAuth = (req: Request, res: Response) => {
  const user = (req.session as CustomSession)?.user;

  if (user && user.user_id) {
    // Kullanıcı giriş yapmışsa oturum verisini döndür
    res.status(200).json({ success: true, user });
  } else {
    // Kullanıcı oturum açmamışsa hata döndür
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};


// Google OAuth yönlendirmesi
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth geri dönüş işlemi
/*
-------------------------------
Giriş bilgilerini frontend'e göndermediğimiz içi frontend'in korumalı route'unda sıkıntı çıkıyor
ek olarak passport içindeki gömülü isAuthenticated fonksiyonu google dışı girişlerde çalışacak mı dene
*/
export const googleCallback = (req: Request, res: Response) => {
  console.log(req, "in")
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }

  // `req.user` tipini doğru belirlemek için:
  const user = req.user as { user_id: number; email: string; name: string };

  (req.session as CustomSession).user = {
    user_id: user.user_id,
    email: user.email,
    name: user.name,
  };

  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Session save error" });
    }

    res.redirect('http://localhost:3000/home');
  });
};

// Çıkış işlemi
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.status(200).json({ success: true, message: "Logout successful" });
  });
};