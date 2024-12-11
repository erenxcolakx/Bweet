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
exports.getTrendingBooks = exports.getPublicPosts = exports.deletePost = exports.sortPosts = exports.updatePost = exports.searchBooks = exports.addPost = exports.getBookPosts = exports.getPosts = void 0;
const postModel = __importStar(require("../model/model.js"));
const multer_1 = __importDefault(require("multer"));
const logger_1 = __importDefault(require("../config/logger")); // Import the logger
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.session.user.user_id;
        const posts = yield postModel.getAllPosts(userId);
        logger_1.default.info(`Posts retrieved for user: ${userId}`);
        res.status(200).json({ success: true, posts, user: req.session.user.email });
    }
    catch (error) {
        logger_1.default.error('Error retrieving posts:', error);
        res.status(500).json({ success: false, message: "Failed to retrieve posts" });
    }
});
exports.getPosts = getPosts;
const getBookPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, author } = req.params; // URL'den title ve author'u alıyoruz
    const userId = (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.user_id;
    try {
        // Kitabı title ve author'a göre sorguluyoruz
        const books = yield postModel.getBookPostsByTitleAndAuthor(title, author);
        if (!books || books.length === 0) {
            logger_1.default.warn(`Book not found for title: "${title}" and author: "${author}"`);
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        // cover_id içeren kitabı bul, yoksa ilk kitabı al
        const book = books.find(b => b.cover_id) || books[0];
        // Kapak resmi base64'e dönüştürülüyor
        if (book.cover_image && Buffer.isBuffer(book.cover_image)) {
            book.cover_image = book.cover_image.toString('base64');
        }
        // Yorumları getiriyoruz
        const posts = yield postModel.getBookPostsByTitleAndAuthor(title, author);
        logger_1.default.info(`Book details and comments retrieved for title: "${title}" and author: "${author}"`);
        res.status(200).json({
            success: true,
            message: 'Book details and comments retrieved successfully',
            book: book,
            posts: posts,
            user: userId
        });
    }
    catch (error) {
        logger_1.default.error(`Error fetching book details and comments for title: "${title}" and author: "${author}"`, { error });
        res.status(500).json({ success: false, message: 'Failed to fetch book details and comments' });
    }
});
exports.getBookPosts = getBookPosts;
const addPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, author, review, isPublic, coverId } = req.body;
    const rating = parseFloat(req.body.rating);
    const time = new Date();
    const userId = req.session.user.user_id;
    const coverImage = req.file;
    try {
        let result;
        if (coverId) {
            result = yield postModel.addPostWithCoverId(title, author, review, rating, time, userId, isPublic, coverId);
            logger_1.default.info(`Post added with coverId for userId: ${userId}`);
        }
        else if (coverImage) {
            const coverImageBuffer = coverImage.buffer;
            result = yield postModel.addPostWithCoverImage(title, author, review, rating, time, userId, isPublic, coverImageBuffer);
            logger_1.default.info(`Post added with coverImage for userId: ${userId}`);
        }
        else {
            result = yield postModel.addPostWithoutCover(title, author, review, rating, time, userId, isPublic);
            logger_1.default.info(`Post added without cover for userId: ${userId}`);
        }
        res.status(201).json({ success: true, message: "Book added successfully", result: result });
    }
    catch (error) {
        logger_1.default.error(`Error adding book for userId: ${userId}`, error);
        res.status(500).json({ success: false, message: "Failed to add book" });
    }
});
exports.addPost = addPost;
const searchBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.query;
    try {
        if (!title) {
            logger_1.default.warn('Search request without title parameter');
            return res.status(400).json({ message: 'Title parameter is required' });
        }
        const books = yield postModel.searchBooks(title);
        logger_1.default.info(`Books searched with title: ${title}`);
        res.json(books);
    }
    catch (error) {
        logger_1.default.error('Error searching books:', error);
        res.status(500).json({ message: 'Error searching books' });
    }
});
exports.searchBooks = searchBooks;
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewId = req.body.id;
    const editedReview = req.body.editedReview.trim();
    const editedRating = req.body.editedRating;
    const isPublic = req.body.isPublic;
    const time = new Date();
    const userId = req.session.user.user_id;
    try {
        const result = yield postModel.updatePost(reviewId, editedReview, editedRating, isPublic, time, userId);
        logger_1.default.info(`Post updated for reviewId: ${reviewId}, userId: ${userId}`);
        res.status(200).json({ success: true, message: "Book updated successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error updating book for reviewId: ${reviewId}, userId: ${userId}`, error);
        res.status(500).json({ success: false, message: "Failed to update book" });
    }
});
exports.updatePost = updatePost;
const sortPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sortType = req.body.sortType;
    const userId = req.session.user.user_id;
    try {
        const posts = yield postModel.getSortedPosts(sortType, userId);
        logger_1.default.info(`Posts sorted for userId: ${userId} with sortType: ${sortType}`);
        res.status(200).json({ success: true, posts });
    }
    catch (error) {
        logger_1.default.error(`Error sorting book reviews for userId: ${userId}`, error);
        res.status(500).json({ success: false, message: "Failed to sort book reviews" });
    }
});
exports.sortPosts = sortPosts;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = Number(req.params.id);
    const userId = req.session.user.user_id;
    try {
        yield postModel.deletePost(postId, userId);
        logger_1.default.info(`Post deleted for postId: ${postId}, userId: ${userId}`);
        res.status(200).json({ success: true, message: "Book review deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error deleting post for postId: ${postId}, userId: ${userId}`, error);
        res.status(500).json({ success: false, message: "Failed to delete book review" });
    }
});
exports.deletePost = deletePost;
const getPublicPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicPosts = yield postModel.getPublicPosts();
        if (publicPosts) {
            logger_1.default.info('Public posts retrieved successfully');
            return res.status(200).json({ success: true, posts: publicPosts });
        }
        else {
            logger_1.default.warn('No public posts found');
            return res.status(404).json({ success: false, message: 'No public posts found' });
        }
    }
    catch (error) {
        logger_1.default.error('Error fetching public posts:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.getPublicPosts = getPublicPosts;
const getTrendingBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trendingBooks = yield postModel.getTrendingBooks();
        logger_1.default.info('Trending books retrieved successfully');
        res.status(200).json({
            success: true,
            books: trendingBooks,
        });
    }
    catch (error) {
        logger_1.default.error('Error in getTrendingBooks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending books',
        });
    }
});
exports.getTrendingBooks = getTrendingBooks;
