import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';  // useAuth hook'unu içe aktarıyoruz
import { useNavigate } from 'react-router-dom';

const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAuth();  // user bilgisini global state'den alıyoruz
  const navigate = useNavigate();
  // user nesnesinin email ve userId bilgilerini alıyoruz
  const userEmail = user?.email || "User";  // email varsa alıyoruz, yoksa 'User' gösteriyoruz
  const userName = user?.name || "User"; //
  function handleProfile(): void {
    navigate("/myprofile")
  }

  return (
    <header className="py-3 mb-3 border-bottom">
      <div className="container-fluid d-flex flex-column gap-3 align-items-center" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-md-between justify-content-center">
          <div className="d-flex align-items-center justify-content-center">
            <Link to="/books">
              <img src="/images/favicon.png" alt="book icon" className="mb-3 mt-3" width="32px" />
            </Link>
            <h1 className="text-blue mt-2 ms-2 lobster-regular">Bweet</h1>
          </div>
          <div className="row d-flex flex-column my-3">
            {user ? (
              <div className="dropdown d-flex justify-content-center">
                <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {userName !== "User" ? (userName):(userEmail)}   {/* user email bilgisi varsa göster, yoksa 'User' olarak göster */}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button type="button" className="dropdown-item" onClick={handleProfile}>My Profile</button>
                    <button type="button" className="dropdown-item" onClick={onLogout}>Log out</button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-outline-dark">Login</Link>
                <Link to="/register" className="btn btn-outline-dark">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
