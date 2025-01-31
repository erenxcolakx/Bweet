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
exports.updateProfile = exports.getUserInfo = exports.getProfile = void 0;
const authModel = __importStar(require("../model/model.js"));
const logger_1 = __importDefault(require("../config/logger")); // Import the logger
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!userId) {
            logger_1.default.warn("Unauthorized access attempt to get profile");
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const user = yield authModel.getUserById(userId.toString());
        if (!user) {
            logger_1.default.warn(`User not found: userId = ${userId}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        logger_1.default.info(`Profile retrieved for userId: ${userId}`);
        return res.status(200).json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.getProfile = getProfile;
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const loggedUserId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.user_id;
        if (!loggedUserId) {
            logger_1.default.warn("Unauthorized access attempt to get user info");
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        const userId = req.params.id;
        const user = yield authModel.getPublicUserInfosById(Number(userId));
        if (!user) {
            logger_1.default.warn(`User not found: userId = ${userId}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        logger_1.default.info(`Public user info retrieved for userId: ${userId}`);
        return res.status(200).json({
            success: true,
            user: {
                user_id: user.user_id,
                name: user.name,
                posts: user.posts
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching user info for userId: ${req.params.id}`, error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.getUserInfo = getUserInfo;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name } = req.body;
    const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.user_id;
    if (!userId) {
        logger_1.default.warn("Unauthorized access attempt to update profile");
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    try {
        const result = yield authModel.updateUserName(userId, name);
        if (result) {
            logger_1.default.info(`Profile updated successfully for userId: ${userId}`);
            return res.status(200).json({ success: true, message: 'Profile updated successfully' });
        }
        else {
            logger_1.default.error(`Failed to update profile for userId: ${userId}`);
            return res.status(500).json({ success: false, message: 'Failed to update profile' });
        }
    }
    catch (error) {
        logger_1.default.error(`Error updating profile for userId: ${userId}`, error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.updateProfile = updateProfile;
