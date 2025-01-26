"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes/routes"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("./controllers/passport")); // Passport.js configuration
const logger_1 = __importDefault(require("./config/logger")); // Import the logger
dotenv_1.default.config({
    path: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development'
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Static files
app.use(express_1.default.static("public"));
// Body parser middleware
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// CORS options
const corsOptions = {
    origin: [
        'http://localhost:3000', // Local development
        'https://bweet-fe.vercel.app', // Ana Vercel domain
        'https://bweet-fe-git-main-erenxcolakxs-projects.vercel.app', // Git branch deployment
        'https://bweet-grtag86bw-erenxcolakxs-projects.vercel.app', // Preview deployment
        /\.vercel\.app$/ // Diğer olası Vercel subdomain'leri için
    ],
    credentials: true, // Cookie ve auth header'lar için gerekli
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
// Check for SECRET_KEY
if (!process.env.SECRET_KEY) {
    logger_1.default.error("SECRET_KEY environment variable is not defined");
    throw new Error("SECRET_KEY environment variable is not defined");
}
else {
    logger_1.default.info("SECRET_KEY is defined and ready");
}
// Session configuration
app.use((0, express_session_1.default)({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));
logger_1.default.info("Session middleware configured");
// Passport.js initialization
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
logger_1.default.info("Passport.js initialized");
// Router middleware
app.use(routes_1.default);
logger_1.default.info("Routes are set up");
// Server start
app.listen(PORT, () => {
    logger_1.default.info(`Server started on http://localhost:${PORT}`);
});
