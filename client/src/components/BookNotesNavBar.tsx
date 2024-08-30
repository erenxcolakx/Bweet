import React from 'react';
import { Link } from 'react-router-dom';

const BookNotesNavBar: React.FC = () => {
  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="../images/favicon.png" alt="BookNotes icon" width="50" height="50" className="d-inline-block align-text-top me-2" />
        </Link>
      </div>
    </nav>
  );
};

export default BookNotesNavBar;
