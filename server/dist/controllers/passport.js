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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const authModel = __importStar(require("../model/model")); // User model
const logger_1 = __importDefault(require("../config/logger")); // Import logger
// Google OAuth Strategy configuration
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:4000/api/google/callback`,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`Google OAuth login attempt for profile: ${profile.emails[0].value}`);
        // Check if a user exists with the email from the Google profile
        let user = yield authModel.getUserByEmail(profile.emails[0].value);
        if (user) {
            logger_1.default.info(`User found with email: ${profile.emails[0].value}`);
            return done(null, user); // Return the user if the email already exists
        }
        // Check if the user signed up with Google before using the Google ID
        user = yield authModel.getUserByGoogleId(profile.id);
        if (!user) {
            // If no user exists, create a new user
            logger_1.default.info(`No user found with Google ID: ${profile.id}. Creating new user.`);
            user = yield authModel.createUserWithGoogle(profile.id, profile.displayName, profile.emails[0].value);
        }
        if (user) {
            logger_1.default.info(`User authenticated successfully: ${user.email}`);
        }
        return done(null, user); // Return the new or existing user
    }
    catch (error) {
        // Type assertion for error
        if (error instanceof Error) {
            logger_1.default.error(`Error during Google OAuth: ${error.message}`);
            return done(error, null); // Return the error if something goes wrong
        }
        else {
            logger_1.default.error('Unknown error during Google OAuth');
            return done(new Error('Unknown error'), null);
        }
    }
})));
// Serialize user for session storage
passport_1.default.serializeUser((user, done) => {
    logger_1.default.info(`Serializing user: ${user.email}`);
    done(null, user.user_id);
});
// Deserialize user from session
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`Deserializing user with ID: ${id}`);
        const user = yield authModel.getUserById(Number(id));
        logger_1.default.info(`User deserialized: ${user.email}`);
        done(null, user);
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`Error deserializing user: ${error.message}`);
            done(error, null);
        }
        else {
            logger_1.default.error('Unknown error during deserialization');
            done(new Error('Unknown error'), null);
        }
    }
}));
exports.default = passport_1.default;
