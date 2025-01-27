"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSessionHealth = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const checkSessionHealth = (req, res, next) => {
    if (req.session && req.session.user) {
        // Refresh the session
        req.session.touch();
        // Log session details for debugging
        logger_1.default.debug('Session health check:', {
            id: req.sessionID,
            cookie: req.session.cookie,
            user: req.session.user.email
        });
    }
    next();
};
exports.checkSessionHealth = checkSessionHealth;
