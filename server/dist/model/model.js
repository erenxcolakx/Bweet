"use strict";
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
exports.getTrendingBooks = exports.createUserWithGoogle = exports.getUserByGoogleId = exports.getSortedPosts = exports.deletePost = exports.getBookPostsByTitleAndAuthor = exports.getPostByBookId = exports.searchBooks = exports.updatePost = exports.addPostWithoutCover = exports.addPostWithCoverImage = exports.addPostWithCoverId = exports.getPublicPosts = exports.getAllPosts = exports.verifyUser = exports.deleteUserById = exports.createUser = exports.updateUserName = exports.getPublicUserInfosById = exports.getUserById = exports.getUserByEmail = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../config/logger")); // Import the logger
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query("SELECT * FROM users WHERE email = $1", [email]);
        logger_1.default.info(`Fetched user by email: ${email}`);
        return result.rows[0] || null;
    }
    catch (error) {
        logger_1.default.error(`Error fetching user by email: ${email}`, { error });
        throw error;
    }
});
exports.getUserByEmail = getUserByEmail;
const getUserById = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query('SELECT user_id, email, name FROM users WHERE user_id = $1', [user_id]);
        logger_1.default.info(`Fetched user by ID: ${user_id}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error fetching user by ID: ${user_id}`, { error });
        throw error;
    }
});
exports.getUserById = getUserById;
const getPublicUserInfosById = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query(`
      SELECT
        u.user_id,
        u.name,
        b.*
      FROM users u
      LEFT JOIN books b ON u.user_id = b.user_id
      WHERE u.user_id = $1 AND (b.is_public = true OR b.is_public IS NULL)
    `, [user_id]);
        logger_1.default.info(`Fetched public user info by ID: ${user_id}`);
        const userInfo = {
            user_id: result.rows[0].user_id,
            name: result.rows[0].name,
            posts: result.rows.filter(row => row.book_id !== null).map(row => ({
                post_id: row.id,
                title: row.title,
                author: row.author,
                review: row.review,
                rating: row.rating,
                cover_id: row.cover_id,
                cover_image: row.cover_image,
                is_public: row.is_public,
                time: row.time
            }))
        };
        return userInfo;
    }
    catch (error) {
        logger_1.default.error(`Error fetching public user info by ID: ${user_id}`, { error });
        throw error;
    }
});
exports.getPublicUserInfosById = getPublicUserInfosById;
const updateUserName = (user_id, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query('UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *', [name, user_id]);
        logger_1.default.info(`Updated username for user ID: ${user_id}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error updating username for user ID: ${user_id}`, { error });
        throw error;
    }
});
exports.updateUserName = updateUserName;
const createUser = (email, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query("INSERT INTO users (email, password, is_verified) VALUES ($1, $2, $3) RETURNING user_id, email", [email, hashedPassword, false]);
        logger_1.default.info(`Created new user: ${email}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error creating user: ${email}`, { error });
        throw error;
    }
});
exports.createUser = createUser;
const deleteUserById = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.query('BEGIN');
        yield database_1.default.query('DELETE FROM books WHERE user_id = $1', [user_id]);
        const result = yield database_1.default.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id]);
        yield database_1.default.query('COMMIT');
        logger_1.default.info(`Deleted user and books for user ID: ${user_id}`);
        return result.rows[0];
    }
    catch (error) {
        yield database_1.default.query('ROLLBACK');
        logger_1.default.error(`Error deleting user by ID: ${user_id}`, { error });
        throw error;
    }
});
exports.deleteUserById = deleteUserById;
const verifyUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.query("UPDATE users SET is_verified = true WHERE user_id = $1", [userId]);
        logger_1.default.info(`Verified user with ID: ${userId}`);
    }
    catch (error) {
        logger_1.default.error(`Error verifying user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.verifyUser = verifyUser;
const getAllPosts = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query('SELECT * FROM books WHERE user_id = $1', [userId]);
        logger_1.default.info(`Fetched all posts for user with ID: ${userId}`);
        return result.rows;
    }
    catch (error) {
        logger_1.default.error(`Error fetching posts for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.getAllPosts = getAllPosts;
const getPublicPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query('SELECT books.*, users.user_id, users.name FROM books INNER JOIN users ON books.user_id = users.user_id WHERE books.is_public = true;');
        logger_1.default.info('Fetched all public posts');
        return result.rows;
    }
    catch (error) {
        logger_1.default.error('Error fetching public posts', { error });
        throw error;
    }
});
exports.getPublicPosts = getPublicPosts;
const addPostWithCoverId = (title, author, review, rating, time, userId, isPublic, coverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      INSERT INTO books (title, author, review, rating, time, user_id, is_public, cover_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const values = [title, author, review, rating, time, userId, isPublic, coverId];
        const result = yield database_1.default.query(query, values);
        logger_1.default.info(`Added post with cover ID for user with ID: ${userId}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error adding post with cover ID for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.addPostWithCoverId = addPostWithCoverId;
const addPostWithCoverImage = (title, author, review, rating, time, userId, isPublic, coverImageBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      INSERT INTO books (title, author, review, rating, time, user_id, is_public, cover_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const values = [title, author, review, rating, time, userId, isPublic, coverImageBuffer];
        const result = yield database_1.default.query(query, values);
        logger_1.default.info(`Added post with cover image for user with ID: ${userId}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error adding post with cover image for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.addPostWithCoverImage = addPostWithCoverImage;
const addPostWithoutCover = (title, author, review, rating, time, userId, isPublic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `
      INSERT INTO books (title, author, review, rating, time, user_id, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [title, author, review, rating, time, userId, isPublic];
        const result = yield database_1.default.query(query, values);
        logger_1.default.info(`Added post without cover for user with ID: ${userId}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error adding post without cover for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.addPostWithoutCover = addPostWithoutCover;
const updatePost = (postId, editedReview, editedRating, isPublic, time, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.query('UPDATE books SET review = $1, rating = $2, is_public = $3, time = $4 WHERE id = $5 AND user_id = $6', [editedReview, editedRating, isPublic, time, postId, userId]);
        logger_1.default.info(`Updated post with ID: ${postId} for user with ID: ${userId}`);
    }
    catch (error) {
        logger_1.default.error(`Error updating post with ID: ${postId} for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.updatePost = updatePost;
const searchBooks = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query(`SELECT id, title, author, cover_id FROM books WHERE is_public = true AND LOWER(title) LIKE LOWER($1)`, [`%${searchTerm}%`]);
        logger_1.default.info(`Searched books with title containing: ${searchTerm}`);
        return result.rows;
    }
    catch (error) {
        logger_1.default.error(`Error searching books with title containing: ${searchTerm}`, { error });
        throw error;
    }
});
exports.searchBooks = searchBooks;
const getPostByBookId = (bookId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query('SELECT * FROM books WHERE id = $1', [bookId]);
        logger_1.default.info(`Fetched post with ID: ${bookId}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error fetching post with ID: ${bookId}`, { error });
        throw error;
    }
});
exports.getPostByBookId = getPostByBookId;
const getBookPostsByTitleAndAuthor = (title, author) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query(`SELECT books.*, users.name
       FROM books
       JOIN users ON books.user_id = users.user_id
       WHERE books.title = $1 AND books.author = $2
       ORDER BY books.time DESC`, [title, author]);
        logger_1.default.info(`Fetched book posts for book with title: "${title}" and author: "${author}"`);
        return result.rows;
    }
    catch (error) {
        logger_1.default.error(`Error fetching book posts for book with title: "${title}" and author: "${author}"`, { error });
        throw error;
    }
});
exports.getBookPostsByTitleAndAuthor = getBookPostsByTitleAndAuthor;
const deletePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [postId, userId]);
        logger_1.default.info(`Deleted post with ID: ${postId} for user with ID: ${userId}`);
    }
    catch (error) {
        logger_1.default.error(`Error deleting post with ID: ${postId} for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.deletePost = deletePost;
const getSortedPosts = (sortType, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = '';
        switch (sortType) {
            case "htl":
                query = 'SELECT * FROM books WHERE user_id = $1 ORDER BY rating DESC';
                break;
            case "lth":
                query = 'SELECT * FROM books WHERE user_id = $1 ORDER BY rating ASC';
                break;
            case "rto":
                query = 'SELECT * FROM books WHERE user_id = $1 ORDER BY time DESC';
                break;
            case "otr":
                query = 'SELECT * FROM books WHERE user_id = $1 ORDER BY time ASC';
                break;
            default:
                throw new Error("Invalid sort type");
        }
        const result = yield database_1.default.query(query, [userId]);
        logger_1.default.info(`Fetched sorted posts for user with ID: ${userId} using sort type: ${sortType}`);
        return result.rows;
    }
    catch (error) {
        logger_1.default.error(`Error fetching sorted posts for user with ID: ${userId} using sort type: ${sortType}`, { error });
        throw error;
    }
});
exports.getSortedPosts = getSortedPosts;
const getUserByGoogleId = (googleId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'SELECT * FROM users WHERE google_id = $1';
        const result = yield database_1.default.query(query, [googleId]);
        logger_1.default.info(`Fetched user by Google ID: ${googleId}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error fetching user by Google ID: ${googleId}`, { error });
        throw error;
    }
});
exports.getUserByGoogleId = getUserByGoogleId;
const createUserWithGoogle = (googleId, name, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `INSERT INTO users (google_id, name, email, is_verified) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = yield database_1.default.query(query, [googleId, name, email, true]);
        logger_1.default.info(`Created user with Google ID: ${googleId}`);
        return result.rows[0];
    }
    catch (error) {
        logger_1.default.error(`Error creating user with Google ID: ${googleId}`, { error });
        throw error;
    }
});
exports.createUserWithGoogle = createUserWithGoogle;
const getTrendingBooks = () => __awaiter(void 0, void 0, void 0, function* () {
    const TRENDING_INTERVAL = '7 days';
    try {
        const query = `
      SELECT
        b.title,
        b.author,
        b.cover_id,
        b.cover_image,
        AVG(b.rating) AS rating,
        COUNT(b.title) AS review_count
      FROM books b
      WHERE b.is_public = true
        AND b.time >= NOW() - INTERVAL '${TRENDING_INTERVAL}'
      GROUP BY b.title, b.author, b.cover_id, b.cover_image
      ORDER BY review_count DESC
      LIMIT 10;
    `;
        const result = yield database_1.default.query(query);
        logger_1.default.info(`Fetched trending books for the past ${TRENDING_INTERVAL}`);
        return result.rows;
    }
    catch (error) {
        logger_1.default.error('Error fetching trending books', { error });
        throw new Error('Error fetching trending books');
    }
});
exports.getTrendingBooks = getTrendingBooks;
