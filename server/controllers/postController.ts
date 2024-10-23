import * as postModel from '../model/model.js';
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';
import multer from 'multer';
import path from 'path';

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
    res.status(200).json({ success: true, posts, user: (req.session as CustomSession).user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve posts" });
  }
}

export const getBookPosts = async (req: Request, res: Response) => {
  const { bookId } = req.params; // URL'den bookId'yi alıyoruz
  const userId = (req.session as CustomSession).user?.user_id; // Auth middleware'inden user id'yi alıyoruz (auth kullanıyorsanız)

  try {
    // Kitap detaylarını getiriyoruz
    const book = await postModel.getPostByBookId(parseInt(bookId, 10));

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.cover_image && Buffer.isBuffer(book.cover_image)) {
      book.cover_image = book.cover_image.toString('base64'); // Base64 string'e çeviriyoruz
    }

    // Yorumları getiren fonksiyon (yorumlar veritabanında ise)
    const posts = await postModel.getBookPostsByBookId(parseInt(bookId, 10));

    res.status(200).json({
      success: true,
      message: 'Book details and comments retrieved successfully',
      book: book,
      posts: posts,
      user: userId
    });
  } catch (error) {
    console.error('Error fetching book details and comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book details and comments' });
  }
};

export const addPost = async (req: Request, res: Response, next: NextFunction) => {
  const { title, author, review, isPublic, coverId } = req.body;
  const rating = parseFloat(req.body.rating);
  const time = new Date();
  const userId = (req.session as CustomSession).user.user_id;

  // Yüklenen kapak resmi dosyası
  const coverImage = req.file;

  try {
    let result;
    
    if (coverId) {
      // Eğer coverId varsa bu veriyi kullan
      result = await postModel.addPostWithCoverId(title, author, review, rating, time, userId, isPublic, coverId);
    } else if (coverImage) {
      // Eğer coverImage yüklenmişse bu veriyi kullan
      const coverImageBuffer = coverImage.buffer;
      result = await postModel.addPostWithCoverImage(title, author, review, rating, time, userId, isPublic, coverImageBuffer);
    } else {
      // Eğer ne coverId ne de coverImage yoksa hata ver
      result = await postModel.addPostWithoutCover(title, author, review, rating, time, userId, isPublic);
    }

    res.status(201).json({ success: true, message: "Book added successfully", result: result });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
};


export const searchBooks = async (req: Request, res: Response) => {
  const { title } = req.query;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Title parameter is required' });
    }

    const books = await postModel.searchBooks(title as string);

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
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
    // Call the updated model function to handle review, rating, and public status
    const result = await postModel.updatePost(reviewId, editedReview, editedRating, isPublic, time, userId);

    res.status(200).json({ success: true, message: "Book updated successfully" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: "Failed to update book" });
  }
}


export const sortPosts = async (req: Request, res: Response, next: NextFunction) => {
  const sortType = req.body.sortType;
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const posts = await postModel.getSortedPosts(sortType, userId);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error while sorting book reviews:", error);
    res.status(500).json({ success: false, message: "Failed to sort book reviews" });
  }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const result = await postModel.deletePost(postId, userId);
    res.status(200).json({ success: true, message: "Book review deleted successfully" });
  } catch (error) {
    console.error("Error deleting book review:", error);
    res.status(500).json({ success: false, message: "Failed to delete book review" });
  }
}


export const getPublicPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Veritabanından yalnızca 'is_public' true olan postları çekiyoruz
    const publicPosts = await postModel.getPublicPosts();

    if (publicPosts) {
      return res.status(200).json({ success: true, posts: publicPosts });
    } else {
      return res.status(404).json({ success: false, message: 'No public posts found' });
    }
  } catch (error) {
    console.error('Error fetching public posts:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getTrendingBooks = async (req: Request, res: Response) => {
  try {
    const trendingBooks = await postModel.getTrendingBooks();
    res.status(200).json({
      success: true,
      books: trendingBooks,
    });
  } catch (error) {
    console.error('Error in getTrendingBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending books',
    });
  }
};