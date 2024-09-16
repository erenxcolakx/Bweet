import * as postModel from '../model/model.js';
import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

interface CustomSession extends Session {
  user: {
    user_id: number;
    email: string;
  };
}

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as CustomSession).user.user_id;
    const posts = await postModel.getAllBooks(userId);
    res.status(200).json({ success: true, posts, user: (req.session as CustomSession).user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve posts" });
  }
}

export const getBook = async (req: Request, res: Response, next: NextFunction) => {
  const title = req.query.title as string;
  const author = req.query.author as string;
  const coverId = req.query.coverId as string;
  res.status(200).json({
    success: true,
    title,
    author,
    coverId,
    user: (req.session as CustomSession).user.email
  });
}

export const getBookReviews = async (req: Request, res: Response) => {
  const { bookId } = req.params; // URL'den bookId'yi alıyoruz
  const userId = (req.session as CustomSession).user?.user_id; // Auth middleware'inden user id'yi alıyoruz (auth kullanıyorsanız)

  try {
    // Kitap detaylarını getiriyoruz
    const book = await postModel.getBookById(parseInt(bookId, 10));

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Yorumları getiren fonksiyon (yorumlar veritabanında ise)
    const reviews = await postModel.getBookReviewsByBookId(parseInt(bookId, 10));

    res.status(200).json({
      success: true,
      message: 'Book details and comments retrieved successfully',
      book: book,        // Kitap bilgileri
      reviews: reviews, // Kitapla ilgili yorumlar
      user: userId        // Kullanıcı bilgisi (auth kullanıyorsanız)
    });
  } catch (error) {
    console.error('Error fetching book details and comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book details and comments' });
  }
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  const title = req.body.title;
  const author = req.body.author;
  const coverId = req.body.coverId;
  const review = req.body.review;
  const isPublic = req.body.isPublic;
  const rating = parseFloat(req.body.rating);
  const time = new Date();
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const result = await postModel.addBook(title, author, coverId, review, rating, time, userId, isPublic);
    res.status(201).json({ success: true, message: "Book added successfully", result: result });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
}

export const searchBooks = async (req: Request, res: Response) => {
  const { title } = req.query;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Title parameter is required' });
    }

    // Veritabanında başlığa göre arama (örnek MongoDB sorgusu)
    const books = await postModel.searchBooks(title as string);

    res.json(books);
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ message: 'Error searching books' });
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.body.id;
  const editedReview = req.body.editedReview.trim();
  const editedRating = req.body.editedRating;
  const isPublic = req.body.isPublic;
  const time = new Date();
  const userId = (req.session as CustomSession).user.user_id;

  try {
    // Call the updated model function to handle review, rating, and public status
    const result = await postModel.updateBook(bookId, editedReview, editedRating, isPublic, time, userId);

    res.status(200).json({ success: true, message: "Book updated successfully" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: "Failed to update book" });
  }
}


export const sortBooks = async (req: Request, res: Response, next: NextFunction) => {
  const sortType = req.body.sortType;
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const posts = await postModel.getSortedBooks(sortType, userId);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error while sorting books:", error);
    res.status(500).json({ success: false, message: "Failed to sort books" });
  }
}

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const result = await postModel.deleteBook(postId, userId);
    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: "Failed to delete book" });
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