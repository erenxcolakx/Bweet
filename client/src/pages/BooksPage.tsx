import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import BookPost from '../components/BookPost';
import { useAuth } from '../contexts/AuthContext'; // AuthContext'ten user bilgisini çekmek için
import { useNavigate } from 'react-router-dom'; // useNavigate'i ekliyoruz


const BooksPage: React.FC = () => {
  interface Post {
    id: number;
    title: string;
    author: string;
    cover_id: string;
    rating: number;
    review: string;
    time: string;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate(); // useNavigate'i kullanıyoruz

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/books`, {
          withCredentials: true, // Oturum çerezlerini içermesini sağlar
        });
        if (response.data.success) {
          setPosts(response.data.posts);
        }
      } catch (err) {
        console.error('Failed to load posts');
      }
    };
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/logout`, {
        withCredentials: true, // Oturum çerezlerini içermesini sağlar
      });
      setUser(null);
      console.log('Logged out')
      navigate('/'); // useNavigate ile yönlendiriyoruz
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const handleSort = async (sortType: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/sort`, { sortType });
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to sort posts');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/delete/${id}`);
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Failed to delete post');
    }
  };

  const handleUpdate = async (id: number, editedReview: string) => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/edit`, { id, editedReview });
      setPosts(posts.map(post => post.id === id ? { ...post, review: editedReview } : post));
    } catch (error) {
      console.error('Failed to update post');
    }
  };

  return (
    <div>
      <Header onLogout={handleLogout} />
      <SearchBar />
      <SortDropdown onSort={handleSort} />
      <div className="row d-flex flex-column gap-2 justify-content-center align-content-center mx-lg-5 px-5 py-1">
        {posts.map(post => (
          <BookPost key={post.id} post={post} onDelete={handleDelete} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
};

export default BooksPage;
