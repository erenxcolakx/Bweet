import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  user: string | null; // null ise kullanıcı giriş yapmamış demektir
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="py-3 mb-3 border-bottom">
      <div className="container-fluid d-flex flex-column gap-3 align-items-center" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="container d-flex flex-wrap justify-content-md-between justify-content-center">
          <div className="d-flex align-items-center">
            <Link to="/books">
              <img src="/images/favicon.png" alt="book icon" className="mb-3" width="48px" />
            </Link>
            <h1 className="text-orange mt-2 josefin-sans-1">BookNotes</h1>
          </div>
          <div className="row d-flex flex-column my-3">
            {user ? (
              <div className="dropdown">
                <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {user}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button type="button" className="dropdown-item" onClick={onLogout}>Log out</button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-outline-light">Login</Link>
                <Link to="/signup" className="btn btn-outline-light">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
