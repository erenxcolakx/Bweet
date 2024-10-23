import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import TrendingBooks from './TrendingBooks';

const HomePageComponent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { user } = useAuth();
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    // Debounce ayarı: Mevcut timeout'u temizle
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Kullanıcı yazmayı bitirene kadar bekle, ardından istek gönder
    const newTimeout = setTimeout(async () => {
      if (inputValue.length > 2) {
        const searchResults = await fetchData(inputValue);
        setSuggestions(searchResults);
      } else {
        setSuggestions([]);
      }
    }, 600); // 500ms gecikme ayarlandı

    setDebounceTimeout(newTimeout);
  };


  return (
    <div>
      {/* Featured Section */}
      <div className="features container mt-5">
        <div className="row d-flex justify-content-around">
          <div className="col-md-3 text-center">
            <img src="../images/trackbooks.webp" alt="Track Books" className="mb-3 rounded-3 w-100" width="264px" />
            <h4>Track Books</h4>
            <p>Create your personal book list.</p>
          </div>
          <div className="col-md-3 text-center">
            <img src="../images/bookrecommendation.webp" alt="Book Recommendations" className="mb-3 rounded-3 w-100" width="264px" />
            <h4>Book Recommendations</h4>
            <p>Get reading suggestions.</p>
          </div>
          <div className="col-md-3 text-center">
            <img src="../images/sharebooks.webp" alt="Share Books" className="mb-3 rounded-3 w-100" width="264px" />
            <h4>Share with the Community</h4>
            <p>Share your book reviews with friends.</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="d-flex col-12">
      <form className="container w-100 px-5 mt-5">
        <input
          type="search"
          className="form-control"
          placeholder="Enter the book name"
          aria-label="Search"
          value={query}
          onChange={handleInputChange}
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '15px',
            fontSize: '1.2rem',
            borderRadius: '30px'
          }}
        />
        <div className="dropdown mt-2 d-flex justify-content-center">
          <ul id="dropdownList" className="list-group" style={{maxWidth:'600px'}}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <img
                    className="mini-book-img"
                    src={`https://covers.openlibrary.org/b/id/${suggestion.coverId}.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`}
                    alt={suggestion.title}
                  />
                  <p className="ms-2">
                    <span className="suggestion-title">{suggestion.title}</span> by{' '}
                    <span className="suggestion-author">{suggestion.authorName}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>

      {/* Trending Books Section */}
      <TrendingBooks/>
    </div>
  );
}
async function fetchData(searchTerm: string) {
  try {
    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${searchTerm}&fields=title,author_name,first_publish_year,cover_i&limit=15`
    );
    const docs = response.data.docs;

    const searchData = docs.map((doc: any) => {
      const title = doc.title ? doc.title : 'N/A';
      const publishYear = doc.first_publish_year ? doc.first_publish_year : 'N/A';
      const coverId = doc.cover_i ? doc.cover_i : 'N/A';
      const authorName = doc.author_name ? doc.author_name[0] : 'N/A';

      return {
        title: title,
        publishYear: publishYear,
        coverId: coverId,
        authorName: authorName,
      };
    });
    console.log(searchData);
    return searchData;
  } catch (error) {
    console.error('Error fetching data: ', error);
    return [];
  }
}

export default HomePageComponent;
