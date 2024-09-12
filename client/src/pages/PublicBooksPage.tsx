import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PublicPost from '../components/PublicPost';
import Header from '../components/Header';

interface Post {
    id: number;
    title: string;
    author: string;
    review: string;
    rating: number;
    time: string;
    cover_id: string;
    is_public: boolean;
    name: string;
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
        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/home`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setPosts(response.data.posts);
        }
      } catch (error) {
        console.error('Failed to fetch public posts:', error);
      }
    };

    fetchPublicPosts();
  });

  return (
    <div>
      <Header/>
      {posts.map((post) => (
        <PublicPost key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PublicBooksPage;
