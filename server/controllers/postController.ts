import * as postModel from '../model/model.js';
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import multer from 'multer';
import path from 'path';
import logger from '../config/logger';  // Import the logger

const storage = multer.memoryStorage();
const upload = multer({ storage });

interface CustomSession extends Session {
  user: {
    user_id: number;
    email: string;
  };
}

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as CustomSession).user.user_id;
    const posts = await postModel.getAllPosts(userId);
    logger.info(`Posts retrieved for user: ${userId}`);
    res.status(200).json({ success: true, posts, user: (req.session as CustomSession).user.email });
  } catch (error) {
    logger.error('Error retrieving posts:', error);
    res.status(500).json({ success: false, message: "Failed to retrieve posts" });
  }
}

export const getBookPosts = async (req: Request, res: Response) => {
  const { title, author } = req.params;  // URL'den title ve author'u alıyoruz
  const userId = (req.session as CustomSession).user?.user_id;

  try {
    // Kitabı title ve author'a göre sorguluyoruz
    const books = await postModel.getBookPostsByTitleAndAuthor(title, author);

    if (!books || books.length === 0) {
      logger.warn(`Book not found for title: "${title}" and author: "${author}"`);
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // cover_id içeren kitabı bul, yoksa ilk kitabı al
    const book = books.find(b => b.cover_id) || books[0];

    // Kapak resmi base64'e dönüştürülüyor
    if (book.cover_image && Buffer.isBuffer(book.cover_image)) {
      book.cover_image = book.cover_image.toString('base64');
    }

    // Yorumları getiriyoruz
    const posts = await postModel.getBookPostsByTitleAndAuthor(title, author);

    logger.info(`Book details and comments retrieved for title: "${title}" and author: "${author}"`);
    res.status(200).json({
      success: true,
      message: 'Book details and comments retrieved successfully',
      book: book,
      posts: posts,
      user: userId
    });
  } catch (error) {
    logger.error(`Error fetching book details and comments for title: "${title}" and author: "${author}"`, { error });
    res.status(500).json({ success: false, message: 'Failed to fetch book details and comments' });
  }
};

export const addPost = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    logger.warn('Unauthorized attempt to add post: No session');
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const { title, author, review, isPublic, coverId } = req.body;
  const rating = parseFloat(req.body.rating);
  const time = new Date();
  const userId = req.session.user.user_id;

  const coverImage = req.file;

  try {
    let result;
    
    if (coverId) {
      result = await postModel.addPostWithCoverId(title, author, review, rating, time, userId, isPublic, coverId);
      logger.info(`Post added with coverId for userId: ${userId}`);
    } else if (coverImage) {
      const coverImageBuffer = coverImage.buffer;
      result = await postModel.addPostWithCoverImage(title, author, review, rating, time, userId, isPublic, coverImageBuffer);
      logger.info(`Post added with coverImage for userId: ${userId}`);
    } else {
      result = await postModel.addPostWithoutCover(title, author, review, rating, time, userId, isPublic);
      logger.info(`Post added without cover for userId: ${userId}`);
    }

    res.status(201).json({ success: true, message: "Book added successfully", result: result });
  } catch (error) {
    logger.error(`Error adding book for userId: ${userId}`, error);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
};

export const searchBooks = async (req: Request, res: Response) => {
  const { title } = req.query;

  try {
    if (!title) {
      logger.warn('Search request without title parameter');
      return res.status(400).json({ message: 'Title parameter is required' });
    }

    const books = await postModel.searchBooks(title as string);
    logger.info(`Books searched with title: ${title}`);
    res.json(books);
  } catch (error) {
    logger.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books' });
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const reviewId = req.body.id;
  const editedReview = req.body.editedReview.trim();
  const editedRating = req.body.editedRating;
  const isPublic = req.body.isPublic;
  const time = new Date();
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const result = await postModel.updatePost(reviewId, editedReview, editedRating, isPublic, time, userId);
    logger.info(`Post updated for reviewId: ${reviewId}, userId: ${userId}`);
    res.status(200).json({ success: true, message: "Book updated successfully" });
  } catch (error) {
    logger.error(`Error updating book for reviewId: ${reviewId}, userId: ${userId}`, error);
    res.status(500).json({ success: false, message: "Failed to update book" });
  }
};

export const sortPosts = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    logger.warn('Unauthorized attempt to sort posts: No session');
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const sortType = req.body.sortType;
  const userId = req.session.user.user_id;

  try {
    const posts = await postModel.getSortedPosts(sortType, userId);
    logger.info(`Posts sorted for userId: ${userId} with sortType: ${sortType}`);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    logger.error(`Error sorting book reviews for userId: ${userId}`, error);
    res.status(500).json({ success: false, message: "Failed to sort book reviews" });
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const userId = (req.session as CustomSession).user.user_id;

  try {
    await postModel.deletePost(postId, userId);
    logger.info(`Post deleted for postId: ${postId}, userId: ${userId}`);
    res.status(200).json({ success: true, message: "Book review deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting post for postId: ${postId}, userId: ${userId}`, error);
    res.status(500).json({ success: false, message: "Failed to delete book review" });
  }
};

export const getPublicPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publicPosts = await postModel.getPublicPosts();

    if (publicPosts) {
      logger.info('Public posts retrieved successfully');
      return res.status(200).json({ success: true, posts: publicPosts });
    } else {
      logger.warn('No public posts found');
      return res.status(404).json({ success: false, message: 'No public posts found' });
    }
  } catch (error) {
    logger.error('Error fetching public posts:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getTrendingBooks = async (req: Request, res: Response) => {
  try {
    const trendingBooks = await postModel.getTrendingBooks();
    logger.info('Trending books retrieved successfully');
    res.status(200).json({
      success: true,
      books: trendingBooks,
    });
  } catch (error) {
    logger.error('Error in getTrendingBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending books',
    });
  }
};
