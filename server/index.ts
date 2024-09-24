import express from "express";
import router from "./routes/routes";
import session from 'express-session';
import env from 'dotenv';
import cors from 'cors';
import passport from "./controllers/passport";  // Passport.js yapılandırması
env.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Static dosyaları sunma
app.use(express.static("public"));

// Body parser için middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS yapılandırması
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],  // Frontend uygulamanızın çalıştığı URL
  methods: 'GET,POST,PUT,DELETE',    // İzin verilen HTTP metodları
  credentials: true                  // Credential (cookie, authorization headers vb.) içeren istekleri kabul et
}));

// SECRET_KEY kontrolü
if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is not defined");
}

// Session configuration
app.use(session({
  secret: process.env.SECRET_KEY!,
  resave: false, // Only save session if modified
  saveUninitialized: false, // Do not save empty sessions
  cookie: {
    secure: false, // Set true for HTTPS
    httpOnly: true, // Prevent JavaScript access to cookies
    maxAge: 24 * 60 * 60 * 1000, // 24-hour session lifetime
    sameSite: 'lax' // Cross-site request protection
  }
}));

// Passport.js initialization
app.use(passport.initialize());
app.use(passport.session());

// Router middleware
app.use(router);

// Sunucu başlatma
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
