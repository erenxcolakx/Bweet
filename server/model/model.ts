import db from '../config/database';
import logger from '../config/logger';  // Import the logger

interface User {
  is_verified: boolean;
  user_id: number;
  email: string;
  password?: string;
  google_id?: string;
  name: string
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    logger.info(`Fetched user by email: ${email}`);
    return result.rows[0] || null;
  } catch (error) {
    logger.error(`Error fetching user by email: ${email}`, { error });
    throw error;
  }
};

export const getUserById = async (user_id: number) => {
  try {
    const result = await db.query('SELECT user_id, email, name FROM users WHERE user_id = $1', [user_id]);
    logger.info(`Fetched user by ID: ${user_id}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error fetching user by ID: ${user_id}`, { error });
    throw error;
  }
};

export const getPublicUserInfosById = async (user_id: number) => {
  try {
    const result = await db.query(`
      SELECT
        u.user_id,
        u.name,
        b.*
      FROM users u
      LEFT JOIN books b ON u.user_id = b.user_id
      WHERE u.user_id = $1 AND (b.is_public = true OR b.is_public IS NULL)
    `, [user_id]);

    logger.info(`Fetched public user info by ID: ${user_id}`);

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
  } catch (error) {
    logger.error(`Error fetching public user info by ID: ${user_id}`, { error });
    throw error;
  }
};


export const updateUserName = async (user_id: number, name: string) => {
  try {
    const result = await db.query('UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *', [name, user_id]);
    logger.info(`Updated username for user ID: ${user_id}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error updating username for user ID: ${user_id}`, { error });
    throw error;
  }
};

export const createUser = async (email: string, hashedPassword: string): Promise<{ user_id: number, email: string }> => {
  try {
    const result = await db.query(
      "INSERT INTO users (email, password, is_verified) VALUES ($1, $2, $3) RETURNING user_id, email",
      [email, hashedPassword, false]
    );
    logger.info(`Created new user: ${email}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error creating user: ${email}`, { error });
    throw error;
  }
};

export const deleteUserById = async (user_id: number) => {
  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM books WHERE user_id = $1', [user_id]);
    const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id]);
    await db.query('COMMIT');
    logger.info(`Deleted user and books for user ID: ${user_id}`);
    return result.rows[0];
  } catch (error) {
    await db.query('ROLLBACK');
    logger.error(`Error deleting user by ID: ${user_id}`, { error });
    throw error;
  }
};

export const verifyUser = async (userId: number) => {
  try {
    await db.query("UPDATE users SET is_verified = true WHERE user_id = $1", [userId]);
    logger.info(`Verified user with ID: ${userId}`);
  } catch (error) {
    logger.error(`Error verifying user with ID: ${userId}`, { error });
    throw error;
  }
};

interface Post {
  id: number;
  title: string;
  author: string;
  cover_id: number | null;
  cover_image: Buffer | null;
  post: string;
  rating: number;
  time: Date;
  user_id: number;
}

export const getAllPosts = async (userId: number): Promise<Post[]> => {
  try {
    const result = await db.query('SELECT * FROM books WHERE user_id = $1', [userId]);
    logger.info(`Fetched all posts for user with ID: ${userId}`);
    return result.rows;
  } catch (error) {
    logger.error(`Error fetching posts for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const getPublicPosts = async () => {
  try {
    const result = await db.query('SELECT books.*, users.user_id, users.name FROM books INNER JOIN users ON books.user_id = users.user_id WHERE books.is_public = true;');
    logger.info('Fetched all public posts');
    return result.rows;
  } catch (error) {
    logger.error('Error fetching public posts', { error });
    throw error;
  }
};

export const addPostWithCoverId = async (title: string, author: string, review: string, rating: number, time: Date, userId: number, isPublic: boolean, coverId: string) => {
  try {
    const query = `
      INSERT INTO books (title, author, review, rating, time, user_id, is_public, cover_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [title, author, review, rating, time, userId, isPublic, coverId];
    const result = await db.query(query, values);
    logger.info(`Added post with cover ID for user with ID: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error adding post with cover ID for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const addPostWithCoverImage = async (title: string, author: string, review: string, rating: number, time: Date, userId: number, isPublic: boolean, coverImageBuffer: Buffer) => {
  try {
    const query = `
      INSERT INTO books (title, author, review, rating, time, user_id, is_public, cover_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [title, author, review, rating, time, userId, isPublic, coverImageBuffer];
    const result = await db.query(query, values);
    logger.info(`Added post with cover image for user with ID: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error adding post with cover image for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const addPostWithoutCover = async (title: string, author: string, review: string, rating: number, time: Date, userId: number, isPublic: boolean) => {
  try {
    const query = `
      INSERT INTO books (title, author, review, rating, time, user_id, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [title, author, review, rating, time, userId, isPublic];
    const result = await db.query(query, values);
    logger.info(`Added post without cover for user with ID: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error adding post without cover for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const updatePost = async (postId: number, editedReview: string, editedRating: number, isPublic: boolean, time: Date, userId: number): Promise<void> => {
  try {
    await db.query(
      'UPDATE books SET review = $1, rating = $2, is_public = $3, time = $4 WHERE id = $5 AND user_id = $6',
      [editedReview, editedRating, isPublic, time, postId, userId]
    );
    logger.info(`Updated post with ID: ${postId} for user with ID: ${userId}`);
  } catch (error) {
    logger.error(`Error updating post with ID: ${postId} for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const searchBooks = async (searchTerm: string): Promise<any[]> => {
  try {
    const result = await db.query(
      `SELECT id, title, author, cover_id FROM books WHERE is_public = true AND LOWER(title) LIKE LOWER($1)`,
      [`%${searchTerm}%`]
    );
    logger.info(`Searched books with title containing: ${searchTerm}`);
    return result.rows;
  } catch (error) {
    logger.error(`Error searching books with title containing: ${searchTerm}`, { error });
    throw error;
  }
};

export const getPostByBookId = async (bookId: number) => {
  try {
    const result = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);
    logger.info(`Fetched post with ID: ${bookId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error fetching post with ID: ${bookId}`, { error });
    throw error;
  }
};

export const getBookPostsByTitleAndAuthor = async (title: string, author: string) => {
  try {
    const result = await db.query(
      `SELECT books.*, users.name
       FROM books
       JOIN users ON books.user_id = users.user_id
       WHERE books.title = $1 AND books.author = $2
       ORDER BY books.time DESC`,
      [title, author]
    );
    logger.info(`Fetched book posts for book with title: "${title}" and author: "${author}"`);
    return result.rows;
  } catch (error) {
    logger.error(`Error fetching book posts for book with title: "${title}" and author: "${author}"`, { error });
    throw error;
  }
};

export const deletePost = async (postId: number, userId: number): Promise<void> => {
  try {
    await db.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [postId, userId]);
    logger.info(`Deleted post with ID: ${postId} for user with ID: ${userId}`);
  } catch (error) {
    logger.error(`Error deleting post with ID: ${postId} for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const getSortedPosts = async (sortType: string, userId: number): Promise<Post[]> => {
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
    const result = await db.query(query, [userId]);
    logger.info(`Fetched sorted posts for user with ID: ${userId} using sort type: ${sortType}`);
    return result.rows;
  } catch (error) {
    logger.error(`Error fetching sorted posts for user with ID: ${userId} using sort type: ${sortType}`, { error });
    throw error;
  }
};

export const getUserByGoogleId = async (googleId: string) => {
  try {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await db.query(query, [googleId]);
    logger.info(`Fetched user by Google ID: ${googleId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error fetching user by Google ID: ${googleId}`, { error });
    throw error;
  }
};

export const createUserWithGoogle = async (googleId: string, name: string, email: string) => {
  try {
    const query = `INSERT INTO users (google_id, name, email, is_verified) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await db.query(query, [googleId, name, email, true]);
    logger.info(`Created user with Google ID: ${googleId}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Error creating user with Google ID: ${googleId}`, { error });
    throw error;
  }
};

export const getTrendingBooks = async () => {
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
    const result = await db.query(query);
    logger.info(`Fetched trending books for the past ${TRENDING_INTERVAL}`);
    return result.rows;
  } catch (error) {
    logger.error('Error fetching trending books', { error });
    throw new Error('Error fetching trending books');
  }
};