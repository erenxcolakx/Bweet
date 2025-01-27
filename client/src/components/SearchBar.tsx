import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Suggestion.css';
import '../styles/ReviewModal.css';
import ReviewModal from '../modals/ReviewModal'; // Bileşeni yeni ismiyle import edin
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only redirect if not loading and user is not authenticated
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; // or a loading spinner
  }

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

  const handleSuggestionClick = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSuggestion(null);
  };

  const handleModalSubmit = async (rating: number, review: string, isPublic: boolean) => {
    try {
      if (!user) {
        console.error('User not authenticated');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_ADDRESS}/api/submit`,
        {
          title: selectedSuggestion.title,
          author: selectedSuggestion.authorName,
          coverId: selectedSuggestion.coverId,
          rating,
          review,
          isPublic,
          user_id: user.user_id,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        closeModal();
        window.location.reload();
      } else {
        console.error('Failed to submit review:', response.data.message);
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
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
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item"
                onClick={() => handleSuggestionClick(suggestion)}
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

      {selectedSuggestion && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedSuggestion.title}
          authorName={selectedSuggestion.authorName}
          coverId={selectedSuggestion.coverId}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

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

export default SearchBar;
