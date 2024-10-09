import db from '../config/database';

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
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (user_id: number) => {
  try {
    const result = await db.query('SELECT user_id, email, name FROM users WHERE user_id = $1', [user_id]);
    return result.rows[0];
  } catch (error) {
    throw error
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

    // Kullanıcı bilgileri ve public kitaplar
    console.log("getPublicUser -------------------------", result)
    const userInfo = {
      user_id: result.rows[0].user_id,
      name: result.rows[0].name,
      reviews: result.rows.filter(row => row.book_id !== null).map(row => ({
        review_id: row.id,
        title: row.title,
        author: row.author,
        review: row.review,
        rating: row.rating,
        cover_id: row.cover_id,  // Kitap kapağı bilgisi
        is_public: row.is_public, // Public durumu
        time: row.time // Yayın tarihi
      }))
    };

    return userInfo;
  } catch (error) {
    throw error;
  }
};


export const updateUserName = async (user_id: number, name: string) => {
  try {
    const result = await db.query('UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *', [name, user_id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const createUser = async (email: string, hashedPassword: string): Promise<{ user_id: number, email: string }> => {
  try {
    const result = await db.query(
      "INSERT INTO users (email, password, is_verified) VALUES ($1, $2, $3) RETURNING user_id, email",
      [email, hashedPassword, false]
    );
    return result.rows[0]; // Yeni eklenen kullanıcıyı (user_id ve email) geri döndür
  } catch (error) {
    throw error;
  }
};

export const deleteUserById = async (user_id: number) => { // Transaction işlemi için veritabanı bağlantısını alın
  try {
    await db.query('BEGIN'); // Transaction başlat
    // Önce books tablosundaki kullanıcının kitap yorumlarını sil
    await db.query('DELETE FROM books WHERE user_id = $1', [user_id]);
    // Ardından users tablosundan kullanıcıyı sil
    const result = await db.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id]);

    await db.query('COMMIT'); // Transaction'ı onayla

    console.log("User deleted: ", result.rows[0]);
    return result.rows[0]; // Silinen kullanıcı bilgilerini döndür
  } catch (error) {
    await db.query('ROLLBACK'); // Hata durumunda işlem iptal edilir
    throw error;
  }
};

export const verifyUser = async (userId: number) => {
  try {
    await db.query("UPDATE users SET is_verified = true WHERE user_id = $1", [userId]);
  } catch (error) {
    throw error;
  }
};

interface Review {
  id: number;
  title: string;
  author: string;
  cover_id: number | null;
  review: string;
  rating: number;
  time: Date;
  user_id: number;
}

export const getAllPosts = async (userId: number): Promise<Review[]> => {
  try {
    const result = await db.query('SELECT * FROM books WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const getPublicPosts = async () => {
  try {
    const result = await db.query('SELECT books.*, users.user_id, users.name FROM books INNER JOIN users ON books.user_id = users.user_id WHERE books.is_public = true;');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const addReview = async (
  title: string,
  author: string,
  coverId: string | null,
  review: string,
  rating: number,
  time: Date,
  userId: number,
  isPublic: boolean
): Promise<void> => {
  const validCoverId = coverId === null ? null : (isNaN(parseInt(coverId)) ? null : parseInt(coverId));
  try {
    await db.query('INSERT INTO books (title, author, cover_id, review, rating, time, user_id, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
      [title, author, validCoverId, review, rating, time, userId, isPublic]);
  } catch (error) {
    throw error;
  }
};


export const updateReview = async (
  postId: number,
  editedReview: string,
  editedRating: number,
  isPublic: boolean,
  time: Date,
  userId: number
): Promise<void> => {
  try {
    await db.query(
      'UPDATE books SET review = $1, rating = $2, is_public = $3, time = $4 WHERE id = $5 AND user_id = $6',
      [editedReview, editedRating, isPublic, time, postId, userId]
    );
  } catch (error) {
    throw error;
  }
};

export const searchBooks = async (searchTerm: string): Promise<any[]> => {
  try {
    // SQL sorgusu: title alanında arama ve is_public == true kontrolü
    const result = await db.query(
      `SELECT id, title, author, cover_id FROM books WHERE is_public = true AND LOWER(title) LIKE LOWER($1)`,
      [`%${searchTerm}%`] // SQL'de LIKE araması için '%' işareti kullanılır
    );
    return result.rows; // Sonuçları döndürüyoruz
  } catch (error) {
    throw error;
  }
};


export const getReviewByBookId = async (bookId: number) => {
  try {
    const result = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);
    return result.rows[0]; // Kitap detayını döndür
  } catch (error) {
    throw error;
  }
};

export const getBookReviewsByBookId = async (bookId: number) => {
  try {
    const result = await db.query(
      `SELECT books.id, books.user_id, books.review, books.rating, books.time, users.name
       FROM books
       JOIN users ON books.user_id = users.user_id
       WHERE books.id = $1
       ORDER BY books.time DESC`,
      [bookId]
    );
    return result.rows; // Yorumları döndürüyoruz
  } catch (error: any) {
    throw new Error(`Error fetching comments for book with ID ${bookId}: ${error.message}`);
  }
};


// Delete post function
export const deleteReview = async (postId: number, userId: number): Promise<void> => {
  try {
    await db.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [postId, userId]);
  } catch (error) {
    throw error;
  }
};


export const getSortedReviews = async (sortType: string, userId: number): Promise<Review[]> => {
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

export const getUserByGoogleId = async (googleId: string) => {
  const query = 'SELECT * FROM users WHERE google_id = $1';
  const result = await db.query(query, [googleId]);
  return result.rows[0];
};

export const createUserWithGoogle = async (googleId: string, name: string, email: string) => {
  const verified = true;
  const query = `INSERT INTO users (google_id, name, email, is_verified) VALUES ($1, $2, $3, $4) RETURNING *`;
  const result = await db.query(query, [googleId, name, email, verified]);
  return result.rows[0];
};

export const getTrendingBooks = async () => {
  const query = `
    SELECT
      b.title,
      b.author,
      b.cover_id,
      AVG(b.rating) AS rating,
      COUNT(b.title) AS review_count
    FROM books b
    WHERE b.is_public = true
      AND b.time >= NOW() - INTERVAL '7 days'
    GROUP BY b.title, b.author, b.cover_id
    ORDER BY review_count DESC
    LIMIT 10;
  `;

  try {
    const result = await db.query(query);
    return result.rows;  // Kitap ve yorum sayılarını döndürüyoruz
  } catch (error) {
    console.error('Error fetching trending books:', error);
    throw new Error('Error fetching trending books');
  }
};
