import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'

interface Book {
  title: string;
  author: string;
  cover_id: number;
  cover_image: Buffer | null;
  rating: number;
  review_count: number;
}

const TrendingBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  const navigate = useNavigate();

  const handleBookClick = (title: string, author: string) => {
    navigate(`/books/${encodeURIComponent(title)}/${encodeURIComponent(author)}`);
  };

  useEffect(() => {
    // Trending books API çağrısı
    const fetchTrendingBooks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/trending-books`);
        setBooks(response.data.books);
      } catch (error) {
        console.error('Error fetching trending books:', error);
      }
    };

    fetchTrendingBooks();
  }, []);

  return (
    <div className="trending-books container mt-5">
      <h2 className="text-center">Trending Books</h2>
      <p className="text-center">(This week)</p>
      <div
        className="d-flex mt-4"
        style={{ overflowX: 'scroll', gap: '1rem', padding: '1rem' }}
      >
        {books.map((book, index) => (
          <div key={index} className="card" style={{ minWidth: '250px' }}>
            <img
              src={
                book.cover_id
                  ? `https://covers.openlibrary.org/b/id/${book.cover_id}.jpg`
                  : book.cover_image
                  ? `data:image/jpeg;base64,${book.cover_image}`
                  : '/images/defbookcover.jpg'
              }
              className="card-img-top"
              alt={book.title}
              style={{maxHeight:'350px'}}
            />
            <div className="card-body">
              <h5 className="book-text oswald-sm card-title"
                style={{ cursor: 'pointer' }}
                onClick={() => handleBookClick(book.title, book.author)}>{book.title}
              </h5>
              <p className="card-text">Author: {book.author}</p>
              <p className="card-text">Rating: {book.rating}</p>
              <p className="card-text">Comments: {book.review_count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingBooks;
