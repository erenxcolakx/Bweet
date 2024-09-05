import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

import * as authModel from '../model/model.js';
import * as emailModel from '../model/mailModel.js';

import env from 'dotenv'
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import cors from 'cors';
interface CustomSession extends Session {
  user: {
    user_id: number;
    email: string;
  };
}

const app = express();
const port = 5000;
const saltRounds = 10;
env.config();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'], // Birden fazla URL'ye izin ver
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));


if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is not defined");
}

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true,
  cookie: {
      secure: false, // HTTPS üzerinde çalışıyorsanız true yapın
      httpOnly: true, // Çerezlerin JavaScript tarafından okunmasını engeller
      maxAge: 24 * 60 * 60 * 1000, // 24 saatlik oturum
      sameSite: 'lax' // Çerezleri çapraz site saldırılarına karşı korur, isteklerin site içinden geldiğini doğrular
  }
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.user = (req.session as CustomSession).user;
    next();
  });


  export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.username;
    const loginPassword = req.body.password;

    try {
        const result = await authModel.getUserByEmail(email);
        if (result) {
            const user = result;
            const storedHashedPassword = user.password;

            const isMatch = await bcrypt.compare(loginPassword, storedHashedPassword);
            if (isMatch) {
              (req.session as CustomSession).user = { user_id: user.user_id, email: user.email };
              req.session.save((err) => {
                  if (err) {
                      console.error("Session save error:", err);
                      return res.status(500).json({ success: false, message: "Session save error" });
                  }
                  console.log("Session save success");
                  res.status(200).json({ success: true, message: "Login successful", user: { email: user.email, user_id: user.user_id } });
              });
          } else {
                res.status(401).json({ success: false, message: "Incorrect password" });
            }
        } else {
            res.status(404).json({ success: false, message: "User not found" });
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


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log("Session in isAuthenticated:", (req.session as CustomSession).user)
  if ((req.session as CustomSession) && (req.session as CustomSession).user && (req.session as CustomSession).user.user_id) {
      next();
  } else {
      console.log("Session in isAuthenticated:", "You must be logged in to view this page")
      res.status(401).json({ success: false, message: "You must be logged in to view this page" });
  }
};


app.listen(port, () => {
    console.log(`Auth server running on port ${port}`);
});
