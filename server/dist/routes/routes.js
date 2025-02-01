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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const postController = __importStar(require("../controllers/postController"));
const auth = __importStar(require("../controllers/auth"));
const profileController = __importStar(require("../controllers/profileController"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const passport_1 = __importDefault(require("../controllers/passport")); // Google OAuth için passport yapılandırması
const convertImagesToBase64_1 = __importDefault(require("../middlewares/convertImagesToBase64"));
const FILE_SIZE_LIMIT = 1 * 1024 * 1024;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: FILE_SIZE_LIMIT } // 1 MB dosya boyutu sınırı
});
// Mevcut Auth ve Profile işlemleri
router.route("/api/login").post([
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], auth.handleLogin);
router.route("/api/register").post(auth.handleRegister);
router.route("/api/verify-email").get(auth.handleEmailVerification);
router.route("/api/profile").get(auth.isAuthenticated, profileController.getProfile);
router.route("/api/profile/update").post(auth.isAuthenticated, profileController.updateProfile);
router.route('/api/delete-account').post(auth.isAuthenticated, auth.deleteAccount);
router.route('/api/check-auth').get(auth.checkAuth);
router.route("/api/logout").get(auth.handleLogout);
// Books işlemleri
router.route("/api/books").get(auth.isAuthenticated, convertImagesToBase64_1.default, postController.getPosts);
router.route("/api/books/search").get(auth.isAuthenticated, convertImagesToBase64_1.default, postController.searchBooks);
router.route('/api/books/:title/:author').get(convertImagesToBase64_1.default, postController.getBookPosts);
router.route("/api/submit").post(auth.isAuthenticated, upload.single('coverImage'), postController.addPost);
router.route("/api/edit").post(auth.isAuthenticated, postController.updatePost);
router.route("/api/sort").post(auth.isAuthenticated, convertImagesToBase64_1.default, postController.sortPosts);
router.route("/api/delete/:id").post(auth.isAuthenticated, postController.deletePost);
router.route("/api/home").get(auth.isAuthenticated, convertImagesToBase64_1.default, postController.getPublicPosts);
router.route("/api/user/:id").get(auth.isAuthenticated, convertImagesToBase64_1.default, profileController.getUserInfo);
router.route("/api/trending-books").get(convertImagesToBase64_1.default, postController.getTrendingBooks);
// Google OAuth yönlendirmesi
router.route('/api/google').get(auth.googleLogin);
// Google OAuth geri dönüş işlemi
router.route('/api/google/callback').get(passport_1.default.authenticate('google', {
    session: false, // Don't use session
    failureRedirect: `${process.env.FRONTEND_URL}/login`
}), auth.googleCallback);
// Google ve genel çıkış işlemi
router.route('/api/logout').get(auth.logout); // Google logout işlemi için controller'a yönlendirme
// Root path yönlendirmesi
router.route("/").get((req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'https://bweet-fe.vercel.app/');
});
// Favicon yönlendirmeleri
router.route("/favicon.ico").get((req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/favicon.ico`);
});
router.route("/favicon.png").get((req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/favicon.png`);
});
exports.default = router;
