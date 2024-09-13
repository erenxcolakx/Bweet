import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

interface Book {
  book_id: number;
  title: string;
  author: string;
  review: string;
  rating: number;
  cover_id: string;
  is_public: boolean;
  time: string;
}

interface UserProfile {
  user_id: number;
  name: string;
  bio?: string;
  profileImage?: string;
  email?: string;
  books: Book[]; // Kullanıcının public kitapları
}

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URL'deki id parametresini alır
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/user/${id}`, {
          withCredentials: true,
        });
        setTargetUser(response.data.user); // Backend'den gelen "user" verisi kullanılıyor
        setLoading(false);
      } catch (error) {
        setError('Kullanıcı profili alınamadı.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, user, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!targetUser) return <div>User not found</div>;

  return (
    <>
      <Header/>
      <div className="container">
        <div className="profile-header mt-5">
          {/* Profil Bilgileri */}
          {targetUser.profileImage && (
            <img
              src={targetUser.profileImage}
              alt={targetUser.name}
              style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            />
          )}
          <h1>{targetUser.name}</h1>
          {targetUser.bio && <p>{targetUser.bio}</p>}
          {targetUser.email && <p>{targetUser.email}</p>}
        </div>

        {/* Kullanıcının Public Kitapları */}
        <div className="user-books mt-5">
          <h2>Published reviews by {targetUser.name}</h2>
          {targetUser.books.length > 0 ? (
            <div className="row justify-content-evenly">
              {targetUser.books.map((book) => (
                <div className="col-md-4 mb-4" key={book.book_id}>
                  <div className="card h-100" style={{ border: '1px solid #dee2e6' }}>
                    <div className="d-flex justify-content-center align-items-center p-2">
                      <img
                        className="img-fluid rounded-3"
                        style={{
                          maxWidth: '180px',
                          maxHeight: '180px',
                          transition: 'all 0.3s ease-in-out',
                        }}
                        src={`https://covers.openlibrary.org/b/id/${book.cover_id}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
                        alt={book.title}
                      />
                    </div>
                    <div className="card-body d-flex flex-column justify-content-around">
                      <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex flex-column">
                          <div className="d-flex flex-column justify-content-center">
                              <h6 className="card-title mb-1 oswald-mid " style={{fontSize:"25px"}}>{book.title}</h6>
                              <span className="text-black text-center fw-light fst-italic">{book.author}</span>
                          </div>
                        </div>
                      </div>
                      <p
                        className="card-text mt-2 text-center overflow-auto"
                        style={{ maxHeight: '100px', maxWidth: '100%', margin: '0 auto', wordBreak: 'break-word' }}>
                        {book.review}
                      </p>

                      <div className="d-flex align-items-center justify-content-center">
                        <div className="text-warning" style={{ fontSize: '16px' }}>
                          {Array.from({ length: book.rating }, (_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                        <span className="ms-2 text-muted">{book.rating}/5</span>
                      </div>
                      <small className="d-flex text-muted mt-3 justify-content-center">{new Date(book.time).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>User has not yet published a book review.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserPage;
