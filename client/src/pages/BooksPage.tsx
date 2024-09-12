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
    is_public: boolean;
  }

  const [posts, setPosts] = useState<Post[]>([]);


  useEffect(() => {
    // Sayfa yüklendiğinde varsayılan sıralama olarak "Recent to Oldest" uygula
    handleSort('rto');
  }, []);

  const handleSort = async (sortType: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_AUTH_ADDRESS}/api/sort`, { sortType }, {
        withCredentials: true
      });
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to sort posts');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_AUTH_ADDRESS}/api/delete/${id}`,
        {}, // İkinci parametre olarak boş bir veri nesnesi gönderiyoruz
        {
          withCredentials: true, // Üçüncü parametre olarak yapılandırma nesnesi içinde withCredentials
        }
      );
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  };

  const handleUpdate = async (id: number, editedReview: string, editedRating: number, isPublic: boolean) => {
    try {
      await axios.post(`${process.env.REACT_APP_AUTH_ADDRESS}/api/edit`, {
        id,
        editedReview,
        editedRating,
        isPublic
      }, {
        withCredentials: true
      });
      // Update the posts state with the new edited values
      setPosts(posts.map(post =>
        post.id === id
          ? { ...post, review: editedReview, rating: editedRating, is_public: isPublic }
          : post
      ));
    } catch (error) {
      console.error('Failed to update post', error);
    }
  };

  return (
    <div>
      <Header/>
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
