import express from 'express';
import * as postController from '../controllers/postController';
import * as auth from '../controllers/auth';
const router = express.Router();

router.route("/api/login").post(auth.handleLogin);
router.route("/api/register").post(auth.handleRegister);
router.route("/api/logout").get(auth.handleLogout);
router.route("/api/books").get(auth.isAuthenticated, postController.getPosts);
router.route("/api/book").get(auth.isAuthenticated, postController.getBook);
router.route("/api/submit").post(auth.isAuthenticated, postController.addBook);
router.route("/api/edit").post(auth.isAuthenticated, postController.updateBook);
router.route("/api/sort").post(auth.isAuthenticated, postController.sortBooks);
router.route("/api/delete/:id").post(auth.isAuthenticated, postController.deleteBook);


export default router;