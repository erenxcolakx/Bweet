import React from 'react';
import { Link } from 'react-router-dom';

const BweetNavBar: React.FC = () => {
  return (
    <nav className="navbar navbar-light sticky-top bg-white">
      <div className="container-fluid justify-content-start">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="../images/favicon.png" alt="Bweet icon" width="32px" className="d-inline-block align-text-top ms-2" />
        </Link>
        <h1 className="text-blue mt-2 lobster-regular">Bweet</h1>
      </div>
    </nav>
  );
};

export default BweetNavBar;
