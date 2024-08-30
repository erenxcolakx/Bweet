import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import * as postModel from '../model/model.js';
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
    resave: false,
    saveUninitialized: true
  }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.user = (req.session as CustomSession).user;
    next();
  });


  export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.username;
    const loginPassword = req.body.password;

    try {
        const result = await postModel.getUserByEmail(email);
        if (result) {
            const user = result;
            const storedHashedPassword = user.password;

            const isMatch = await bcrypt.compare(loginPassword, storedHashedPassword);
            if (isMatch) {
              (req.session as CustomSession).user = { user_id: user.user_id, email: user.email }; // Kullanıcı bilgilerini session'a kaydet

                res.status(200).json({ success: true, message: "Login successful", user: { email: user.email, user_id: user.user_id } });
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
      const user = await postModel.getUserByEmail(email);

      if (user) {
        res.status(409).json({ success: false, message: 'Email already exists. Try logging in.' });
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.log("Error hashing password", err);
            res.status(500).json({ success: false, message: 'Internal server error' });
          } else {
            await postModel.createUser(email, hash);
            res.status(201).json({ success: true, message: 'User registered successfully' });
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
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
    if ((req.session as CustomSession) && (req.session as CustomSession).user && (req.session as CustomSession).user.user_id) {
      next();
    } else {
      res.status(401).json({ success: false, message: "You must be logged in to view this page" });
    }
};


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
