import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Book {
  book_id: number;
  cover_id: number | null;
  cover_image: Buffer | null;
  title: string;
  author: string;
}

const BookPosts: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>(); // URL parametresinden bookId'yi alıyoruz
  interface Post {
    id: number;
    user_id: number;
    review: string;
    rating: number;
    time: string;
    name: string
  }

  const [posts, setPosts] = useState<Post[]>([]); // Yorumları tutmak için state
  const [book, setBook] = useState<Book | null>(null); // Kitap detaylarını tutmak için state
  const [loading, setLoading] = useState<boolean>(true); // Yükleme durumunu tutmak için


  useEffect(() => {
    const fetchBookPosts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/books/${bookId}`, {
            withCredentials: true,
        }); // Kitap ve yorumları backend'den çek
        setBook(response.data.book); // Kitap detaylarını state'e set et
        setPosts(response.data.posts); // Yorumları state'e set et
        setLoading(false); // Yükleme durumunu kapat
      } catch (error) {
        console.error('Error fetching book comments:', error);
        setLoading(false); // Yükleme hatası durumunda kapat
      }
    };

    fetchBookPosts();
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
                 src={
                  book.cover_id
                    ? `https://covers.openlibrary.org/b/id/${book.cover_id}.jpg`
                    : book.cover_image
                    ? `data:image/jpeg;base64,${book.cover_image}`
                    : '/images/defbookcover.jpg'
                }
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

        {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="card mb-3" style={{margin: 'auto', border: '1px solid #dee2e6' }}>
                <div className="row g-0">
                  <div className="col-md-12">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="rounded-circle d-flex justify-content-center align-items-center"
                              onClick={() => navigate(`/user/${post.user_id}`)}
                              style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '20px',
                                backgroundColor: !post.name || post.name === 'Anonym' ? '#ffffff' : '#000000',
                                color: !post.name || post.name === 'Anonym' ? '#000000' : '#ffffff',
                                border: !post.name || post.name === 'Anonym' ? '1px solid #000000' : '1px solid #ffffff',
                                cursor: post.name ? 'pointer' : 'default'
                              }}
                            >
                              {post.name ? post.name.charAt(0).toUpperCase() : '-'}
                            </div>
                            {/* Kullanıcı Bilgisi, tıklanabilir olacak */}
                            <div className="ms-2">
                              <h6
                                className="card-title mb-1 user-name-text"
                                onClick={() => navigate(`/user/${post.user_id}`)}
                                style={{ cursor: post.name ? 'pointer' : 'default' }} // Cursor işaretçisi tıklanabilirlik durumuna göre değişir
                              >
                                {post.name ? post.name : 'Anonym'}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="card-text mt-2 overflow-auto" style={{ maxHeight: '200px' }}>
                        {post.review}
                      </p>
                      <div className="d-flex align-items-center">
                        <div className="text-warning" style={{ fontSize: '16px' }}>
                          {Array.from({ length: Math.round(post.rating) }, (_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                        </div>
                        <span className="ms-2 text-muted">{post.rating}/5</span>
                      </div>
                      <small className="text-muted mt-3">{new Date(post.time).toLocaleDateString()}</small>
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

export default BookPosts;
