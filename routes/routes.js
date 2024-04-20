import express from 'express';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.route("/").get(postController.getPosts);
router.route("/book").get(postController.getBook);
router.route("/submit").post(postController.addBook);
router.route("/edit").patch(postController.updateBook);
router.route("/sort").post(postController.sortBooks);
router.route("/delete/:id").delete(postController.deleteBook);

export default router;