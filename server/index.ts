import express from "express";
import router from "./routes/routes";
import session from 'express-session';
import env from 'dotenv';
import cors from 'cors';
import passport from "./controllers/passport";  // Passport.js configuration
import logger from './config/logger';  // Import the logger
env.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Static files
app.use(express.static("public"));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],  // Frontend app URLs
  methods: 'GET,POST,PUT,DELETE',  // Allowed HTTP methods
  credentials: true                // Allow cookies and credentials
}));

// Check for SECRET_KEY
if (!process.env.SECRET_KEY) {
  logger.error("SECRET_KEY environment variable is not defined");
  throw new Error("SECRET_KEY environment variable is not defined");
} else {
  logger.info("SECRET_KEY is defined and ready");
}

// Session configuration
app.use(session({
  secret: process.env.SECRET_KEY!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));
logger.info("Session middleware configured");

// Passport.js initialization
app.use(passport.initialize());
app.use(passport.session());
logger.info("Passport.js initialized");

// Router middleware
app.use(router);
logger.info("Routes are set up");

// Server start
app.listen(PORT, () => {
  logger.info(`Server started on http://localhost:${PORT}`);
});
