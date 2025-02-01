import express from 'express';
import { body } from 'express-validator';
import * as postController from '../controllers/postController';
import * as auth from '../controllers/auth';
import * as profileController from '../controllers/profileController';
import multer from 'multer';
const router = express.Router();
import passport from '../controllers/passport'; // Google OAuth için passport yapılandırması
import convertImagesToBase64 from '../middlewares/convertImagesToBase64';
const FILE_SIZE_LIMIT = 1 * 1024 * 1024;
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {  fileSize: FILE_SIZE_LIMIT }  // 1 MB dosya boyutu sınırı
});

// Mevcut Auth ve Profile işlemleri
router.route("/api/login").post([
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], auth.handleLogin);
router.route("/api/register").post(auth.handleRegister);
router.route("/api/verify-email").get(auth.handleEmailVerification);
router.route("/api/profile").get(auth.isAuthenticated, profileController.getProfile);
router.route("/api/profile/update").post(auth.isAuthenticated, profileController.updateProfile);
router.route('/api/delete-account').post(auth.isAuthenticated, auth.deleteAccount);
router.route('/api/check-auth').get(auth.checkAuth);
router.route("/api/logout").get(auth.handleLogout);

// Books işlemleri
router.route("/api/trending-books").get(convertImagesToBase64, postController.getTrendingBooks);
router.route("/api/books").get(auth.isAuthenticated, convertImagesToBase64, postController.getPosts);
router.route("/api/books/search").get(auth.isAuthenticated, convertImagesToBase64, postController.searchBooks);
router.route('/api/books/:title/:author').get(convertImagesToBase64, postController.getBookPosts);
router.route("/api/submit").post(auth.isAuthenticated, upload.single('coverImage'), postController.addPost);
router.route("/api/edit").post(auth.isAuthenticated, postController.updatePost);
router.route("/api/sort").post(auth.isAuthenticated, convertImagesToBase64, postController.sortPosts);
router.route("/api/delete/:id").post(auth.isAuthenticated, postController.deletePost);
router.route("/api/home").get(auth.isAuthenticated, convertImagesToBase64, postController.getPublicPosts);
router.route("/api/user/:id").get(auth.isAuthenticated, convertImagesToBase64, profileController.getUserInfo);

// Google OAuth yönlendirmesi
router.route('/api/google').get(auth.googleLogin);

// Google OAuth geri dönüş işlemi
router.route('/api/google/callback').get(
  passport.authenticate('google', {
    session: false,  // Don't use session
    failureRedirect: `${process.env.FRONTEND_URL}/login`
  }),
  auth.googleCallback
);

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

export default router;