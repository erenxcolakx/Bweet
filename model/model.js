import db from '../config/database.js';

// Function that fetches all books
export const getUserByEmail = async (email) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const createUser = async (email, hashedPassword) => {
  try {
    const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getAllBooks = async (userId) => {
  try {
    const result = await db.query('SELECT * FROM books WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Function that adds a new post
export const addBook = async (title, author, coverId, review, rating, time, userId) => {
  try {
    const result = await db.query('INSERT INTO books (title, author, cover_id, review, rating, time, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [title, author, coverId, review, rating, time, userId]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Post updating function
export const updateBook = async (postId, editedReview, time, userId) => {
  try {
    const result = await db.query('UPDATE books SET review = $1, time = $2 WHERE id = $3 AND user_id = $4', [editedReview, time, postId, userId]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete post function
export const deleteBook = async (postId, userId) => {
  try {
    const result = await db.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [postId,userId]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function that sorts posts by state
export const getSortedBooks = async (sortType, userId) => {
  switch (sortType) {
      case "htl":
          return await db.query('SELECT * FROM books WHERE user_id = $1 ORDER BY rating DESC', [userId]).then(result => result.rows);
      case "lth":
          return await db.query('SELECT * FROM books WHERE user_id = $1 ORDER BY rating ASC', [userId]).then(result => result.rows);
      case "rto":
          return await db.query('SELECT * FROM books WHERE user_id = $1 ORDER BY time DESC', [userId]).then(result => result.rows);
      case "otr":
          return await db.query('SELECT * FROM books WHERE user_id = $1 ORDER BY time ASC', [userId]).then(result => result.rows);
      default:
          throw new Error("Invalid sort type");
  }
};