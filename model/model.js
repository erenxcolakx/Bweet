import db from '../config/database.js';

// Function that fetches all posts
export const getAllBooks = async () => {
  try {
    const result = await db.query("SELECT * FROM posts");
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Function that adds a new post
export const addBook = async (title, author, coverId, review, rating, time) => {
  try {
    const result = await db.query('INSERT INTO posts (title, author, cover_id, review, rating, time) VALUES ($1, $2, $3, $4, $5, $6)', [title, author, coverId, review, rating, time]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Post updating function
export const updateBook = async (postId, editedReview, time) => {
  try {
    const result = await db.query(`UPDATE posts SET review = $1, time = $2 WHERE id = $3`, [editedReview, time, postId]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete post function
export const deleteBook = async (postId) => {
  try {
    const result = await db.query("DELETE FROM posts WHERE id = $1", [postId]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function that sorts posts by state
export const getSortedBooks = async (sortType) => {
    switch (sortType) {
      case "htl":
        return await db.query(`SELECT * FROM posts ORDER BY rating DESC`).then(result => result.rows);
      case "lth":
        return await db.query(`SELECT * FROM posts ORDER BY rating ASC`).then(result => result.rows);
      case "rto":
        return await db.query(`SELECT * FROM posts ORDER BY time DESC`).then(result => result.rows);
      case "otr":
        return await db.query(`SELECT * FROM posts ORDER BY time ASC`).then(result => result.rows);
      default:
        throw new Error("Invalid sort type");
    }
};


