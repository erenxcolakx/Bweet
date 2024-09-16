import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Book {
  book_id: number;
  cover_id: number;
  title: string;
  author: string;
}

const BookReviews: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>(); // URL parametresinden bookId'yi alıyoruz
  interface Review {
    id: number;
    user_id: number;
    review: string;
    rating: number;
    time: string;
    name: string
  }

  const [reviews, setReviews] = useState<Review[]>([]); // Yorumları tutmak için state
  const [book, setBook] = useState<Book | null>(null); // Kitap detaylarını tutmak için state
  const [loading, setLoading] = useState<boolean>(true); // Yükleme durumunu tutmak için
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const handleImageClick = () => {
    setIsImageExpanded(!isImageExpanded); // Fotoğraf tıklandığında büyütme/daraltma
  };

  useEffect(() => {
    const fetchBookReviews = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/books/${bookId}`, {
            withCredentials: true,
        }); // Kitap ve yorumları backend'den çek
        setBook(response.data.book); // Kitap detaylarını state'e set et
        setReviews(response.data.reviews); // Yorumları state'e set et
        setLoading(false); // Yükleme durumunu kapat
      } catch (error) {
        console.error('Error fetching book comments:', error);
        setLoading(false); // Yükleme hatası durumunda kapat
      }
    };

    fetchBookReviews();
  }, [bookId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header/>
      <div className='container'>
        {book && (
           <>
            <div className='mt-3 d-flex flex-md-row flex-column justify-content-md-start justify-content-center '>
             <div className='d-flex justify-content-md-start justify-content-center'>
               <img
                 className="modal-book-img"
                 src={`https://covers.openlibrary.org/b/id/${book.cover_id}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
                 alt={book.title} />
             </div>
             <div className='d-flex flex-column col-auto col-sm-12 col-md-7 col-lg-8'>
               <div className='mx-4 my-1 text-center text-md-start'>
                 <h2 className='oswald-mid mt-md-0 mt-2'>{book.title}</h2>
                 <p>by <span className='fst-italic'>{book.author}</span> </p>
               </div>
             </div>
            </div>
          <h3 className='mt-5 oswald-mid'>Reviews</h3>
          </>
        )}

        {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="card mb-3" style={{margin: 'auto', border: '1px solid #dee2e6' }}>
                <div className="row g-0">
                  <div className="col-md-12">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="rounded-circle d-flex justify-content-center align-items-center"
                              onClick={() => navigate(`/user/${review.user_id}`)}
                              style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '20px',
                                backgroundColor: !review.name || review.name === 'Anonym' ? '#ffffff' : '#000000',
                                color: !review.name || review.name === 'Anonym' ? '#000000' : '#ffffff',
                                border: !review.name || review.name === 'Anonym' ? '1px solid #000000' : '1px solid #ffffff',
                                cursor: review.name ? 'pointer' : 'default'
                              }}
                            >
                              {review.name ? review.name.charAt(0).toUpperCase() : '-'}
                            </div>
                            {/* Kullanıcı Bilgisi, tıklanabilir olacak */}
                            <div className="ms-2">
                              <h6
                                className="card-title mb-1"
                                onClick={() => navigate(`/user/${review.user_id}`)}
                                style={{ cursor: review.name ? 'pointer' : 'default' }} // Cursor işaretçisi tıklanabilirlik durumuna göre değişir
                              >
                                {review.name ? review.name : 'Anonym'}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="card-text mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
                        {review.review}
                      </p>
                      <div className="d-flex align-items-center">
                        <div className="text-warning" style={{ fontSize: '16px' }}>
                          {Array.from({ length: Math.round(review.rating) }, (_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                        <span className="ms-2 text-muted">{review.rating}/5</span>
                      </div>
                      <small className="text-muted mt-3">{new Date(review.time).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p className='oswald-mid'>No reviews available.</p>
        )}
      </div>
    </>
  );
};

export default BookReviews;
