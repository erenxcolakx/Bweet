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

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  const title = req.body.title;
  const author = req.body.author;
  const coverId = req.body.coverId;
  const review = req.body.review;
  const rating = parseFloat(req.body.rating);
  const time = new Date();
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const result = await postModel.addBook(title, author, coverId, review, rating, time, userId);
    res.status(201).json({ success: true, message: "Book added successfully" });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ success: false, message: "Failed to add book" });
  }
}

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.body.id;
  const editedReview = req.body.editedReview.trim();
  const time = new Date();
  const userId = (req.session as CustomSession).user.user_id;

  try {
    const result = await postModel.updateBook(bookId, editedReview, time, userId);
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