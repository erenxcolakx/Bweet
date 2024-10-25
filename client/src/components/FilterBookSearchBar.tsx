import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate kullanımı
import '../styles/Suggestion.css'; // İhtiyaç varsa stil dosyanızı ekleyin

const FilterBookSearchDB: React.FC = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Arama input'u değiştiğinde
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    // Debounce işlemi: Mevcut timeout'u temizle
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Kullanıcı yazmayı bitirene kadar bekle, ardından istek gönder
    const newTimeout = setTimeout(async () => {
      if (inputValue.length > 2) {
        const searchResults = await fetchBooks(inputValue);
        setBooks(searchResults);
      } else {
        setBooks([]);
      }
    }, 500); // 500ms gecikme ayarlandı

    setDebounceTimeout(newTimeout);
  };

  // Kitaplar için database sorgusu yapıyoruz
  const fetchBooks = async (searchTerm: string) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/books/search?title=${searchTerm}`, {
        withCredentials: true,
      }); // API isteği (örn. Express backend)
      return response.data; // Kitap listesini döndürür
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  };

  // Bir kitaba tıklandığında yönlendirme yapılıyor
  const handleBookClick = (title: string, author: string) => {
    navigate(`/books/${encodeURIComponent(title)}/${encodeURIComponent(author)}`); // Title ve author bilgileriyle yönlendirme
  };

  return (
    <div className="d-flex col-12">
      <form className="container w-100 px-5">
        <input
          type="search"
          id="searchInput"
          className="form-control"
          placeholder="Enter the book name"
          aria-label="Search"
          value={query}
          onChange={handleInputChange}
        />
        <div className="dropdown mt-2">
          <ul id="dropdownList" className="list-group">
            {books.map((book, index) => (
              <li
                key={index}
                className="list-group-item"
                onClick={() => handleBookClick(book.title, book.author)} // Tıklanıldığında kitaba yönlendirme
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <img
                    className="rounded-2 img-fluid col-md-12 mini-book-img"
                    src={`https://covers.openlibrary.org/b/id/${book.cover_id}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
                    alt={book.title}
                  />
                  <p className="ms-2">
                    <span className="suggestion-title">{book.title}</span> by{' '}
                    <span className="suggestion-author">{book.author}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
};

export default FilterBookSearchDB;
