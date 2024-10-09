import express from 'express';
import * as postController from '../controllers/postController';
import * as auth from '../controllers/auth';
import * as profileController from '../controllers/profileController';
const router = express.Router();
import passport from '../controllers/passport'; // Google OAuth için passport yapılandırması


// Mevcut Auth ve Profile işlemleri
router.route("/api/login").post(auth.handleLogin);
router.route("/api/register").post(auth.handleRegister);
router.route("/api/verify-email").get(auth.handleEmailVerification);
router.route("/api/profile").get(auth.isAuthenticated, profileController.getProfile);
router.route("/api/profile/update").post(auth.isAuthenticated, profileController.updateProfile);
router.route('/api/delete-account').post(auth.isAuthenticated, auth.deleteAccount);
router.route('/api/check-auth').get(auth.checkAuth);
router.route("/api/logout").get(auth.handleLogout);

// Books işlemleri
router.route("/api/books").get(auth.isAuthenticated, postController.getPosts);
router.route("/api/books/search").get(auth.isAuthenticated, postController.searchBooks);
router.route('/api/books/:bookId').get(auth.isAuthenticated, postController.getBookReviews);
router.route("/api/submit").post(auth.isAuthenticated, postController.addReview);
router.route("/api/edit").post(auth.isAuthenticated, postController.updateReview);
router.route("/api/sort").post(auth.isAuthenticated, postController.sortReviews);
router.route("/api/delete/:id").post(auth.isAuthenticated, postController.deleteReview);
router.route("/api/home").get(auth.isAuthenticated, postController.getPublicPosts);
router.route("/api/user/:id").get(auth.isAuthenticated, profileController.getUserInfo);
router.route("/api/trending-books").get(postController.getTrendingBooks);


// Google OAuth yönlendirmesi
router.route('/api/google').get(auth.googleLogin);

// Google OAuth geri dönüş işlemi
router.route('/api/google/callback').get(
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  auth.googleCallback // Google OAuth callback fonksiyonuna yönlendirme
);

// Google ve genel çıkış işlemi
router.route('/api/logout').get(auth.logout); // Google logout işlemi için controller'a yönlendirme

export default router;