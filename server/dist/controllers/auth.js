"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.googleCallback = exports.googleLogin = exports.checkAuth = exports.isAuthenticated = exports.deleteAccount = exports.handleLogout = exports.handleEmailVerification = exports.handleRegister = exports.handleLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authModel = __importStar(require("../model/model.js"));
const emailModel = __importStar(require("../model/mailModel.js"));
const mailModel_js_1 = require("../model/mailModel.js");
const passport_1 = __importDefault(require("passport"));
const logger_1 = __importDefault(require("../config/logger"));
const saltRounds = 10;
const handleLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.username;
    const loginPassword = req.body.password;
    try {
        const result = yield authModel.getUserByEmail(email);
        if (result) {
            const user = result;
            const storedHashedPassword = user.password;
            if (storedHashedPassword) {
                const isMatch = yield bcrypt_1.default.compare(loginPassword, storedHashedPassword);
                if (isMatch) {
                    if (!user.is_verified) {
                        const token = (0, mailModel_js_1.generateVerificationToken)(user.user_id);
                        (0, mailModel_js_1.sendVerificationEmail)(user.email, token);
                        logger_1.default.info(`Login attempt for unverified user: ${user.email}`);
                        return res.status(403).json({
                            success: false,
                            message: "Your email is not verified. A new verification email has been sent."
                        });
                    }
                    req.session.user = { user_id: user.user_id, email: user.email, name: user.name };
                    req.session.save((err) => {
                        if (err) {
                            logger_1.default.error(`Session save error for user ${user.email}: ${err.message}`);
                            return res.status(500).json({ success: false, message: "Session save error" });
                        }
                        logger_1.default.info(`User ${user.email} logged in successfully`);
                        res.status(200).json({ success: true, message: "Login successful", user: { email: user.email, user_id: user.user_id, name: user.name } });
                    });
                }
                else {
                    logger_1.default.warn(`Incorrect password attempt for user: ${user.email}`);
                    res.status(500).json({ success: false, message: "Incorrect password" });
                }
            }
            else {
                logger_1.default.warn(`Password not found for user: ${user.email}`);
                res.status(401).json({ success: false, message: "Incorrect password" });
            }
        }
        else {
            logger_1.default.warn(`User not found with email: ${email}`);
            res.status(404).json({ success: false, message: "User not found. You can create new account" });
        }
    }
    catch (err) {
        logger_1.default.error(`Login error for email ${email}: ${err}`);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.handleLogin = handleLogin;
// Handle register
const handleRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.username;
    const password = req.body.password;
    try {
        const user = yield authModel.getUserByEmail(email);
        if (user) {
            logger_1.default.warn(`Registration attempt for existing email: ${email}`);
            res.status(409).json({ success: false, message: 'Email already exists. Try logging in.' });
        }
        else {
            bcrypt_1.default.hash(password, saltRounds, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    logger_1.default.error(`Error hashing password for email ${email}: ${err}`);
                    res.status(500).json({ success: false, message: 'Internal server error' });
                }
                else {
                    const newUser = yield authModel.createUser(email, hash);
                    const token = emailModel.generateVerificationToken(newUser.user_id);
                    emailModel.sendVerificationEmail(newUser.email, token);
                    logger_1.default.info(`User registered successfully: ${newUser.email}`);
                    res.status(201).json({ success: true, message: 'Registration successful. Please check your email to verify your account.' });
                }
            }));
        }
    }
    catch (error) {
        logger_1.default.error(`Registration error for email ${email}: ${error}`);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.handleRegister = handleRegister;
// Email Verification Handler
const handleEmailVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        logger_1.default.error("JWT_SECRET environment variable is not defined");
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        const userId = decoded.userId;
        yield authModel.verifyUser(userId);
        logger_1.default.info(`User ${userId} verified their email successfully`);
        res.status(200).json({ success: true, message: 'Email verified successfully!' });
    }
    catch (error) {
        logger_1.default.error(`Invalid or expired token for email verification: ${error}`);
        res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
});
exports.handleEmailVerification = handleEmailVerification;
// Handle logout
const handleLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            logger_1.default.error(`Error destroying session: ${err}`);
            res.status(500).json({ success: false, message: "Error destroying session" });
        }
        else {
            logger_1.default.info('User logged out successfully');
            res.status(200).json({ success: true, message: "Logout successful" });
        }
    });
};
exports.handleLogout = handleLogout;
// Handle account deletion
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!userId) {
            logger_1.default.warn('Unauthorized account deletion attempt');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // Call model function to delete the user
        yield authModel.deleteUserById(userId);
        // Destroy session after deletion
        req.session.destroy((err) => {
            if (err) {
                logger_1.default.error(`Failed to destroy session after deleting user: ${userId}`);
                return res.status(500).json({ success: false, message: 'Failed to delete account' });
            }
            logger_1.default.info(`User account deleted successfully: ${userId}`);
            return res.status(200).json({ success: true, message: 'Account deleted successfully' });
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting account for user ${req.session}: ${error}`);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.deleteAccount = deleteAccount;
const isAuthenticated = (req, res, next) => {
    var _a, _b;
    if ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.user_id) {
        logger_1.default.info(`User authenticated: ${(_b = req.session.user) === null || _b === void 0 ? void 0 : _b.email}`);
        return next();
    }
    logger_1.default.warn('Authentication failed: No valid session');
    res.status(401).json({ success: false, message: "Authentication required" });
};
exports.isAuthenticated = isAuthenticated;
// Check Auth
const checkAuth = (req, res) => {
    var _a;
    const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
    if (user && user.user_id) {
        logger_1.default.info(`User is authenticated: ${user.email}`);
        res.status(200).json({ success: true, user });
    }
    else {
        logger_1.default.warn('Check auth failed. User not authenticated');
        res.status(401).json({ success: false, message: "Not authenticated" });
    }
};
exports.checkAuth = checkAuth;
// Google OAuth yönlendirmesi
exports.googleLogin = passport_1.default.authenticate('google', { scope: ['profile', 'email'] });
// Google OAuth callback
const googleCallback = (req, res) => {
    if (!req.user) {
        logger_1.default.error('Google authentication failed');
        return res.status(401).json({ success: false, message: "Authentication failed" });
    }
    const user = req.user;
    req.session.user = { user_id: user.user_id, email: user.email, name: user.name };
    req.session.save((err) => {
        if (err) {
            logger_1.default.error(`Session save error after Google login for user: ${user.email}`);
            return res.status(500).json({ success: false, message: "Session save error" });
        }
        logger_1.default.info(`User logged in via Google: ${user.email}`);
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/home');
    });
};
exports.googleCallback = googleCallback;
// Logout for OAuth or normal logouts
const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            logger_1.default.error('Error during logout:', err);
            return res.status(500).send('Logout failed');
        }
        logger_1.default.info(`User logged out successfully via OAuth: ${req.session}`);
        res.status(200).json({ success: true, message: "Logout successful" });
    });
};
exports.logout = logout;
