import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="d-flex col-10">
      <form className="w-100" onSubmit={handleSearch}>
        <input
          type="search"
          id="searchInput"
          className="form-control"
          placeholder="Enter the book name"
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="dropdown mt-2">
          <ul id="dropdownList"></ul>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
