"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokenResponse = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("./logger"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRE = '24h';
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        user_id: user.user_id,
        email: user.email,
        name: user.name
    }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        logger_1.default.error('JWT verification failed:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
const sendTokenResponse = (res, user) => {
    const token = (0, exports.generateToken)(user);
    res.status(200).json({
        success: true,
        token,
        user: {
            user_id: user.user_id,
            email: user.email,
            name: user.name
        }
    });
};
exports.sendTokenResponse = sendTokenResponse;
