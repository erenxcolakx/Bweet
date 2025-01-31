import supabase from '../config/database';
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      logger.error(`Error fetching user by email: ${email}`, { error });
      return null;
    }

    logger.info(`Fetched user by email: ${email}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching user by email: ${email}`, { error });
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) throw error;
    logger.info(`Fetched user by ID: ${id}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching user by ID: ${id}`, { error });
    throw error;
  }
};

export const getPublicUserInfosById = async (user_id: number) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id, name')
      .eq('user_id', user_id)
      .single();

    if (userError) throw userError;

    const { data: postsData, error: postsError } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_public', true);

    if (postsError) throw postsError;

    logger.info(`Fetched public user info by ID: ${user_id}`);

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
  } catch (error) {
    logger.error(`Error fetching public user info by ID: ${user_id}`, { error });
    throw error;
  }
};

export const updateUserName = async (userId: string, name: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error updating username for user ${userId}:`, error);
    throw error;
  }
};

export const createUser = async (email: string, hashedPassword: string): Promise<{ user_id: number, email: string }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email, password: hashedPassword, is_verified: false }
      ])
      .select('user_id, email')
      .single();

    if (error) throw error;
    logger.info(`Created new user: ${email}`);
    return data;
  } catch (error) {
    logger.error(`Error creating user: ${email}`, { error });
    throw error;
  }
};

export const deleteUserById = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    logger.info(`User deleted successfully: ${userId}`);
  } catch (error) {
    logger.error(`Error deleting user: ${userId}`, error);
    throw error;
  }
};

export const verifyUser = async (userId: number) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('user_id', userId);

    if (error) throw error;
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

export const getAllPosts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*, users(name)')
      .eq('user_id', userId)
      .order('time', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error getting posts for user ${userId}:`, error);
    throw error;
  }
};

export const getPublicPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*, users!inner(user_id, name)')
      .eq('is_public', true);

    if (error) throw error;
    logger.info('Fetched all public posts');
    return data;
  } catch (error) {
    logger.error('Error fetching public posts', { error });
    throw error;
  }
};

export const addPostWithCoverId = async (
  title: string, 
  author: string, 
  review: string, 
  rating: number, 
  time: Date, 
  userId: string,
  isPublic: boolean, 
  coverId: string
) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([{ title, author, review, rating, time, user_id: userId, is_public: isPublic, cover_id: coverId }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error adding post with coverId for user ${userId}:`, error);
    throw error;
  }
};

export const addPostWithCoverImage = async (
  title: string, 
  author: string, 
  review: string, 
  rating: number, 
  time: Date, 
  userId: string,
  isPublic: boolean, 
  coverImage: Buffer

) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([{ title, author, review, rating, time, user_id: userId, is_public: isPublic, cover_image: coverImage }])
      .select();


    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error adding post with cover image for user ${userId}:`, error);
    throw error;
  }
};

export const addPostWithoutCover = async (
  title: string, 
  author: string, 
  review: string, 
  rating: number, 
  time: Date, 
  userId: string,  // number yerine string
  isPublic: boolean
) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([{ title, author, review, rating, time, user_id: userId, is_public: isPublic }])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error adding post without cover for user ${userId}:`, error);
    throw error;
  }
};

export const updatePost = async (
  reviewId: number,
  editedReview: string,
  editedRating: number,
  isPublic: boolean,
  time: Date,
  userId: string  // number yerine string
) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({ review: editedReview, rating: editedRating, is_public: isPublic, time })
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select();


    if (error) throw error;
    return data;
  } catch (error) {
    logger.error(`Error updating post ${reviewId} for user ${userId}:`, error);
    throw error;
  }
};

export const searchBooks = async (searchTerm: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, cover_id')
      .eq('is_public', true)
      .ilike('title', `%${searchTerm}%`);

    if (error) throw error;
    logger.info(`Searched books with title containing: ${searchTerm}`);
    return data;
  } catch (error) {
    logger.error(`Error searching books with title containing: ${searchTerm}`, { error });
    throw error;
  }
};

export const getPostByBookId = async (bookId: number) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (error) throw error;
    logger.info(`Fetched post with ID: ${bookId}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching post with ID: ${bookId}`, { error });
    throw error;
  }
};

export const getBookPostsByTitleAndAuthor = async (title: string, author: string) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*, users!inner(name)')
      .eq('title', title)
      .eq('author', author)
      .eq('is_public', true);

    if (error) throw error;
    logger.info(`Fetched posts for book: ${title} by ${author}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching posts for book: ${title} by ${author}`, { error });
    throw error;
  }
};

export const deletePost = async (postId: number, userId: string) => {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    logger.info(`Deleted post with ID: ${postId}`);
  } catch (error) {
    logger.error(`Error deleting post ${postId} for user ${userId}:`, error);
    throw error;
  }
};

export const getSortedPosts = async (sortType: string, userId: string): Promise<Post[]> => {
  try {
    let query = supabase
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

    const { data, error } = await query;
    if (error) throw error;

    logger.info(`Fetched sorted posts for user with ID: ${userId}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching sorted posts for user with ID: ${userId}`, { error });
    throw error;
  }
};

export const getUserByGoogleId = async (googleId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      logger.info(`No user found with Google ID: ${googleId}`);
      return null;
    }

    logger.info(`Fetched user by Google ID: ${googleId}`);
    return data;
  } catch (error) {
    logger.error(`Error fetching user by Google ID: ${googleId}`, { error });
    throw error;
  }
};

export const createUserWithGoogle = async (googleId: string, name: string, email: string) => {
  try {
    // Önce email ile kullanıcı kontrolü yapalım
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      // Email zaten varsa, Google ID'yi güncelle
      const { data, error } = await supabase
        .from('users')
        .update({ google_id: googleId })
        .eq('email', email)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }

    // Yeni kullanıcı oluştur (created_at kaldırıldı)
    const { data, error } = await supabase
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
      logger.error('Error creating user with Google:', error);
      throw error;
    }

    logger.info(`Created new user with Google ID: ${googleId}`);
    return data;
  } catch (error) {
    logger.error(`Error in createUserWithGoogle: ${error}`);
    throw error;
  }
};

export const getTrendingBooks = async () => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_public', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) throw error;
    logger.info('Fetched trending books');
    return data;
  } catch (error) {
    logger.error('Error fetching trending books', { error });
    throw error;
  }
};