import db from '../config/database';

interface User {
  is_verified: boolean;
  user_id: number;
  email: string;
  password: string;
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



interface Book {
  id: number;
  title: string;
  author: string;
  cover_id: number | null;
  review: string;
  rating: number;
  time: Date;
  user_id: number;
}

export const getAllBooks = async (userId: number): Promise<Book[]> => {
  try {
    const result = await db.query('SELECT * FROM books WHERE user_id = $1', [userId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};


export const addBook = async (
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
    await db.query('INSERT INTO books (title, author, cover_id, review, rating, time, user_id, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [title, author, validCoverId, review, rating, time, userId, isPublic]);
  } catch (error) {
    throw error;
  }
};


export const updateBook = async (
  postId: number,
  editedReview: string,
  time: Date,
  userId: number
): Promise<void> => {
  try {
    await db.query('UPDATE books SET review = $1, time = $2 WHERE id = $3 AND user_id = $4', [editedReview, time, postId, userId]);
  } catch (error) {
    throw error;
  }
};


// Delete post function
export const deleteBook = async (postId: number, userId: number): Promise<void> => {
  try {
    await db.query('DELETE FROM books WHERE id = $1 AND user_id = $2', [postId, userId]);
  } catch (error) {
    throw error;
  }
};


export const getSortedBooks = async (sortType: string, userId: number): Promise<Book[]> => {
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
