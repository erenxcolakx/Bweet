import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import BookPost from '../components/BookPost';

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
  const [user, setUser] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/posts');
        if (response.data.success) {
          setPosts(response.data.posts);
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to load posts');
      }
    };
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to logout');
    }
  };

  const handleSort = async (sortType: string) => {
    try {
      const response = await axios.post('/sort', { sortType });
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to sort posts');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.post(`/delete/${id}`);
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Failed to delete post');
    }
  };

  const handleUpdate = async (id: number, editedReview: string) => {
    try {
      await axios.post('/edit', { id, editedReview });
      setPosts(posts.map(post => post.id === id ? { ...post, review: editedReview } : post));
    } catch (error) {
      console.error('Failed to update post');
    }
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <SearchBar onSearch={(query) => console.log('Searching:', query)} />
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
