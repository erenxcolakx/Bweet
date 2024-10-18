import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublicPost from '../components/PublicPost';
import Header from '../components/Header';
import FilterBookSearchBar from '../components/FilterBookSearchBar';

interface Post {
    id: number;
    title: string;
    author: string;
    review: string;
    rating: number;
    time: string;
    cover_id: string |null;
    cover_image: Buffer | null;
    is_public: boolean;
    name: string;
    user_id: number;
}

const PublicBooksPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Public postları API'den al
  useEffect(() => {
    const fetchPublicPosts = async () => {
      if (!user) {
        navigate('/login'); // Redirect to login if user is not authenticated
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/home`, {
          withCredentials: true,
        });
        if (response.data.success) {
          // Postları tarihe göre yeniden eskiye sıralama
          const sortedPosts = response.data.posts.sort((a: Post, b: Post) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
          });
          setPosts(sortedPosts);
        }
      } catch (error) {
        console.error('Failed to fetch public posts:', error);
      }
    };

    fetchPublicPosts();
  }, [navigate, user]);

  return (
    <div>
      <Header/>
      <FilterBookSearchBar/>
      {posts.map((post) => (
        <PublicPost key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PublicBooksPage;
