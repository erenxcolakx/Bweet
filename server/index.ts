import express from "express";
import router from "./routes/routes";
import session from 'express-session';
import env from 'dotenv';
import cors from 'cors';
import passport from "./controllers/passport";  // Passport.js configuration
import logger from './config/logger';  // Import the logger
import path from 'path';
import { checkSessionHealth } from './middlewares/sessionHealth';
import { MemoryStore } from 'express-session';
env.config({
  path: process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development'
});

const app = express();
const PORT = process.env.PORT || 4000;

// Static files
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS configuration - ÖNEMLİ: credentials'ı doğru yapılandırmalıyız
const corsOptions = {
  origin: [
    'https://bweet-fe.vercel.app',
    'https://bweet-be.vercel.app',
    'https://bweet-be-git-main-erenxcolakxs-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));
app.enable('trust proxy'); // Important for secure cookies behind a proxy

// Check for SECRET_KEY
if (!process.env.SECRET_KEY) {
  logger.error("SECRET_KEY environment variable is not defined");
  throw new Error("SECRET_KEY environment variable is not defined");
} else {
  logger.info("SECRET_KEY is defined and ready");
}

// Session configuration
app.use(session({
  secret: process.env.SECRET_KEY || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
    domain: '.vercel.app'
  },
  store: new MemoryStore()
}));
logger.info("Session middleware configured");

// Session health check middleware
app.use(checkSessionHealth);

// Initialize passport after session
app.use(passport.initialize());
app.use(passport.session());
logger.info("Passport.js initialized");

// Debug middleware - Session durumunu loglayalım
app.use((req, res, next) => {
  logger.debug('Session Debug:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    user: req.session?.user,
    cookies: req.cookies
  });
  next();
});

// Router middleware
app.use(router);
logger.info("Routes are set up");

// Server start
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
