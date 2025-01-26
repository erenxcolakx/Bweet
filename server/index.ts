import express from "express";
import router from "./routes/routes";
import session from 'express-session';
import env from 'dotenv';
import cors from 'cors';
import passport from "./controllers/passport";  // Passport.js configuration
import logger from './config/logger';  // Import the logger
import path from 'path';
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

// CORS options
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Local development
    'https://bweet-fe.vercel.app',  // Ana Vercel domain
    'https://bweet-fe-git-main-erenxcolakxs-projects.vercel.app', // Git branch deployment
    'https://bweet-grtag86bw-erenxcolakxs-projects.vercel.app',  // Preview deployment
    /\.vercel\.app$/  // Diğer olası Vercel subdomain'leri için
  ],
  credentials: true,  // Cookie ve auth header'lar için gerekli
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Bweet API',
    status: 'running',
    environment: process.env.NODE_ENV
  });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// Server start
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
