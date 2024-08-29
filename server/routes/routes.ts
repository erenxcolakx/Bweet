import express from 'express';
import * as postController from '../controllers/postController';
import * as auth from '../controllers/auth';
const router = express.Router();

router.route("/login").post(auth.handleLogin);
router.route("/register").post(auth.handleRegister);
router.route("/logout").get(auth.handleLogout);
router.route("/books").get(auth.isAuthenticated, postController.getPosts);
router.route("/book").get(auth.isAuthenticated, postController.getBook);
router.route("/submit").post(auth.isAuthenticated, postController.addBook);
router.route("/edit").post(auth.isAuthenticated, postController.updateBook);
router.route("/sort").post(auth.isAuthenticated, postController.sortBooks);
router.route("/delete/:id").post(auth.isAuthenticated, postController.deleteBook);


export default router;