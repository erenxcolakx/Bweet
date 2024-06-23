import express from 'express';
import * as postController from '../controllers/postController.js';
import * as auth from '../controllers/auth.js';
const router = express.Router();

router.route("/").get(postController.homepage);
router.route("/login").get(auth.renderLogin).post(auth.handleLogin);
router.route("/register").get(auth.renderRegister).post(auth.handleRegister);
router.route("/logout").get(auth.handleLogout);
router.route("/books").get(auth.isAuthenticated, postController.getPosts);
router.route("/book").get(auth.isAuthenticated, postController.getBook);
router.route("/submit").post(auth.isAuthenticated, postController.addBook);
router.route("/edit").post(auth.isAuthenticated, postController.updateBook);
router.route("/sort").post(auth.isAuthenticated, postController.sortBooks);
router.route("/delete/:id").post(auth.isAuthenticated, postController.deleteBook);


export default router;