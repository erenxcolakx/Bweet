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
        const { data, error } = yield database_1.default
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        if (error) {
            logger_1.default.error(`Error fetching user by email: ${email}`, { error });
            return null;
        }
        logger_1.default.info(`Fetched user by email: ${email}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching user by email: ${email}`, { error });
        return null;
    }
});
exports.getUserByEmail = getUserByEmail;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('users')
            .select('*')
            .eq('user_id', id)
            .single();
        if (error)
            throw error;
        logger_1.default.info(`Fetched user by ID: ${id}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching user by ID: ${id}`, { error });
        throw error;
    }
});
exports.getUserById = getUserById;
const getPublicUserInfosById = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: userData, error: userError } = yield database_1.default
            .from('users')
            .select('user_id, name')
            .eq('user_id', user_id)
            .single();
        if (userError)
            throw userError;
        const { data: postsData, error: postsError } = yield database_1.default
            .from('books')
            .select('*')
            .eq('user_id', user_id)
            .eq('is_public', true);
        if (postsError)
            throw postsError;
        logger_1.default.info(`Fetched public user info by ID: ${user_id}`);
        return {
            user_id: userData.user_id,
            name: userData.name,
            posts: postsData.map(row => ({
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
    }
    catch (error) {
        logger_1.default.error(`Error fetching public user info by ID: ${user_id}`, { error });
        throw error;
    }
});
exports.getPublicUserInfosById = getPublicUserInfosById;
const updateUserName = (userId, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('users')
            .update({ name })
            .eq('user_id', userId)
            .select();
        if (error)
            throw error;
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error updating username for user ${userId}:`, error);
        throw error;
    }
});
exports.updateUserName = updateUserName;
const createUser = (email, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('users')
            .insert([
            { email, password: hashedPassword, is_verified: false }
        ])
            .select('user_id, email')
            .single();
        if (error)
            throw error;
        logger_1.default.info(`Created new user: ${email}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error creating user: ${email}`, { error });
        throw error;
    }
});
exports.createUser = createUser;
const deleteUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield database_1.default
            .from('users')
            .delete()
            .eq('user_id', userId);
        if (error)
            throw error;
        logger_1.default.info(`User deleted successfully: ${userId}`);
    }
    catch (error) {
        logger_1.default.error(`Error deleting user: ${userId}`, error);
        throw error;
    }
});
exports.deleteUserById = deleteUserById;
const verifyUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield database_1.default
            .from('users')
            .update({ is_verified: true })
            .eq('user_id', userId);
        if (error)
            throw error;
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
        const { data, error } = yield database_1.default
            .from('books')
            .select('*')
            .eq('user_id', userId);
        if (error)
            throw error;
        logger_1.default.info(`Fetched all posts for user with ID: ${userId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching posts for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.getAllPosts = getAllPosts;
const getPublicPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .select('*, users!inner(user_id, name)')
            .eq('is_public', true);
        if (error)
            throw error;
        logger_1.default.info('Fetched all public posts');
        return data;
    }
    catch (error) {
        logger_1.default.error('Error fetching public posts', { error });
        throw error;
    }
});
exports.getPublicPosts = getPublicPosts;
const addPostWithCoverId = (title, author, review, rating, time, userId, isPublic, coverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .insert([
            { title, author, review, rating, time, user_id: userId, is_public: isPublic, cover_id: coverId }
        ])
            .select()
            .single();
        if (error)
            throw error;
        logger_1.default.info(`Added post with cover ID for user with ID: ${userId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error adding post with cover ID for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.addPostWithCoverId = addPostWithCoverId;
const addPostWithCoverImage = (title, author, review, rating, time, userId, isPublic, coverImageBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .insert([
            { title, author, review, rating, time, user_id: userId, is_public: isPublic, cover_image: coverImageBuffer }
        ])
            .select()
            .single();
        if (error)
            throw error;
        logger_1.default.info(`Added post with cover image for user with ID: ${userId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error adding post with cover image for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.addPostWithCoverImage = addPostWithCoverImage;
const addPostWithoutCover = (title, author, review, rating, time, userId, isPublic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .insert([
            { title, author, review, rating, time, user_id: userId, is_public: isPublic }
        ])
            .select()
            .single();
        if (error)
            throw error;
        logger_1.default.info(`Added post without cover for user with ID: ${userId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error adding post without cover for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.addPostWithoutCover = addPostWithoutCover;
const updatePost = (postId, editedReview, editedRating, isPublic, time, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield database_1.default
            .from('books')
            .update({ review: editedReview, rating: editedRating, is_public: isPublic, time })
            .eq('id', postId)
            .eq('user_id', userId);
        if (error)
            throw error;
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
        const { data, error } = yield database_1.default
            .from('books')
            .select('id, title, author, cover_id')
            .eq('is_public', true)
            .ilike('title', `%${searchTerm}%`);
        if (error)
            throw error;
        logger_1.default.info(`Searched books with title containing: ${searchTerm}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error searching books with title containing: ${searchTerm}`, { error });
        throw error;
    }
});
exports.searchBooks = searchBooks;
const getPostByBookId = (bookId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .select('*')
            .eq('id', bookId)
            .single();
        if (error)
            throw error;
        logger_1.default.info(`Fetched post with ID: ${bookId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching post with ID: ${bookId}`, { error });
        throw error;
    }
});
exports.getPostByBookId = getPostByBookId;
const getBookPostsByTitleAndAuthor = (title, author) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .select('*, users!inner(name)')
            .eq('title', title)
            .eq('author', author)
            .eq('is_public', true);
        if (error)
            throw error;
        logger_1.default.info(`Fetched posts for book: ${title} by ${author}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching posts for book: ${title} by ${author}`, { error });
        throw error;
    }
});
exports.getBookPostsByTitleAndAuthor = getBookPostsByTitleAndAuthor;
const deletePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield database_1.default
            .from('books')
            .delete()
            .eq('id', postId)
            .eq('user_id', userId);
        if (error)
            throw error;
        logger_1.default.info(`Deleted post with ID: ${postId}`);
    }
    catch (error) {
        logger_1.default.error(`Error deleting post with ID: ${postId}`, { error });
        throw error;
    }
});
exports.deletePost = deletePost;
const getSortedPosts = (sortType, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = database_1.default
            .from('books')
            .select('*')
            .eq('user_id', userId);
        switch (sortType) {
            case 'rating':
                query = query.order('rating', { ascending: false });
                break;
            case 'date':
                query = query.order('time', { ascending: false });
                break;
            case 'title':
                query = query.order('title');
                break;
            default:
                query = query.order('time', { ascending: false });
        }
        const { data, error } = yield query;
        if (error)
            throw error;
        logger_1.default.info(`Fetched sorted posts for user with ID: ${userId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching sorted posts for user with ID: ${userId}`, { error });
        throw error;
    }
});
exports.getSortedPosts = getSortedPosts;
const getUserByGoogleId = (googleId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('users')
            .select('*')
            .eq('google_id', googleId)
            .maybeSingle();
        if (error)
            throw error;
        if (!data) {
            logger_1.default.info(`No user found with Google ID: ${googleId}`);
            return null;
        }
        logger_1.default.info(`Fetched user by Google ID: ${googleId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error fetching user by Google ID: ${googleId}`, { error });
        throw error;
    }
});
exports.getUserByGoogleId = getUserByGoogleId;
const createUserWithGoogle = (googleId, name, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Önce email ile kullanıcı kontrolü yapalım
        const existingUser = yield (0, exports.getUserByEmail)(email);
        if (existingUser) {
            // Email zaten varsa, Google ID'yi güncelle
            const { data, error } = yield database_1.default
                .from('users')
                .update({ google_id: googleId })
                .eq('email', email)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        }
        // Yeni kullanıcı oluştur (created_at kaldırıldı)
        const { data, error } = yield database_1.default
            .from('users')
            .insert([
            {
                google_id: googleId,
                name,
                email,
                is_verified: true
            }
        ])
            .select()
            .single();
        if (error) {
            logger_1.default.error('Error creating user with Google:', error);
            throw error;
        }
        logger_1.default.info(`Created new user with Google ID: ${googleId}`);
        return data;
    }
    catch (error) {
        logger_1.default.error(`Error in createUserWithGoogle: ${error}`);
        throw error;
    }
});
exports.createUserWithGoogle = createUserWithGoogle;
const getTrendingBooks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield database_1.default
            .from('books')
            .select('*')
            .eq('is_public', true)
            .order('rating', { ascending: false })
            .limit(10);
        if (error)
            throw error;
        logger_1.default.info('Fetched trending books');
        return data;
    }
    catch (error) {
        logger_1.default.error('Error fetching trending books', { error });
        throw error;
    }
});
exports.getTrendingBooks = getTrendingBooks;
