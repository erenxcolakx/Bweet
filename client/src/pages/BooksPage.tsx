import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SortDropdown from '../components/SortDropdown';
import BookPost from '../components/BookPost';
import ManualBookAddButton from '../components/ManualBookAddButton';
import ManualBookModal from '../modals/ManualBookModal';
import { useNavigate } from 'react-router-dom';

const BooksPage: React.FC = () => {
  interface Post {
    id: number;
    title: string;
    author: string;
    cover_id: string | null;
    cover_image: Buffer | null;
    rating: number;
    review: string;
    time: string;
    is_public: boolean;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);  // Modalın açık olup olmadığını takip edin
  const [error, setError] = useState<string | null>(null); // Hata mesajını takip edin
  const navigate = useNavigate();

  // Butona tıklandığında modalı açar
  const handleManualAddClick = () => {
    setIsModalOpen(true);
  };

  // Modalı kapatır
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    // Sayfa yüklendiğinde varsayılan sıralama olarak "Recent to Oldest" uygula
    handleSort('rto');
  }, []);


  const handleSubmit = async (bookData: { coverImage: File | null; title: string; author: string; rating: number; review: string; isPublic: boolean }) => {
    const { coverImage, title, author, rating, review, isPublic } = bookData;
    if (!title || !author || !review) {
      setError("Please fill out all required fields (Title, Author, Review).");
      return;
    }

    const formData = new FormData();
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    formData.append('title', title);
    formData.append('author', author);
    formData.append('rating', String(rating));
    formData.append('review', review);
    formData.append('isPublic', String(isPublic));

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data.success) {
        console.log('Book added successfully');
        setIsModalOpen(false);
        // Refresh the books list after adding
        handleSort('rto');
      } else {
        console.error('Error adding book:', response.data.message);
        setError(response.data.message);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Session expired or invalid
        navigate('/login');
      } else {
        console.error('Error submitting the form:', error);
        setError('Error submitting the form.');
      }
    }
  };

  const handleSort = async (sortType: string) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/sort`, { sortType }, {
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
        `${process.env.REACT_APP_SERVER_ADDRESS}/api/delete/${id}`,
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
      await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/edit`, {
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
      {isModalOpen ? "": <Header /> }
      <SearchBar />
      <div className='row container mx-auto'>
        <ManualBookAddButton onClick={handleManualAddClick} />
        <SortDropdown onSort={handleSort} />
      </div>
      <div className="row d-flex flex-column gap-2 justify-content-center align-content-center mx-lg-5 px-5 py-1">
        {posts.map(post => (
          <BookPost key={post.id} post={post} onDelete={handleDelete} onUpdate={handleUpdate} />
        ))}
      </div>
      <ManualBookModal
        show={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BooksPage;
