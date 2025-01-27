import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useLocation'u ekledik
import { useAuth } from '../contexts/AuthContext';  // useAuth hook'unu içe aktarıyoruz
import axios from 'axios';

const Header: React.FC = () => {
  const { user, setUser } = useAuth();  // user bilgisini ve setUser fonksiyonunu global state'den alıyoruz
  const navigate = useNavigate();
  const location = useLocation(); // Mevcut adresi almak için kullanıyoruz

  useEffect(() => {
    // Session kontrolü
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/check-auth`, {
          withCredentials: true
        });
        
        if (!response.data.success) {
          setUser(null);
          navigate('/login');
        }
      } catch (error) {
        setUser(null);
        navigate('/login');
      }
    };

    if (!user) {
      checkAuth();
    }
  }, [user, setUser, navigate]);

  // user nesnesinin email ve userId bilgilerini alıyoruz
  const userEmail = user?.email || "User";  // email varsa alıyoruz, yoksa 'User' gösteriyoruz
  const userName = user?.name || "User"; 

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/logout`, {
        withCredentials: true,  // Oturum çerezlerini içermesini sağlar
      });
      setUser(null);  // Kullanıcı bilgisini temizliyoruz
      navigate('/');  // Logout sonrası ana sayfaya yönlendiriyoruz
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  function handleProfile(): void {
    navigate("/myprofile");
  }
  function navigateMyBooksPage(): void {
    navigate("/books");
  }
  function navigateHomepage(): void {
    navigate("/home");
  }

  return (
    <header className="mb-3 border-bottom sticky-top bg-white">
      <div className="container-fluid d-flex flex-column gap-3 align-items-center" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <nav className="navbar container d-flex flex-column flex-md-row justify-content-md-between justify-content-center">
          <div className="d-flex align-items-center justify-content-center">
            <Link to="/">
              <img src="/images/favicon.png" alt="book icon" className="mb-3 mt-3" width="32px" />
            </Link>
            <h1 className="text-blue mt-2 ms-2 lobster-regular">Bweet</h1>
          </div>
          <div className="row d-flex flex-column my-3">
            {user ? (
              <div className="dropdown d-flex justify-content-center">
                <ul className="nav flex-row gap-2 justify-content-center">
                  <li className="nav-item">
                    <button 
                      type="button" 
                      className={`btn ${location.pathname === '/home' ? 'active' : ''}`} // Aktif olan sayfaya göre 'active' sınıfı ekliyoruz
                      onClick={navigateHomepage}
                    >
                      Homepage
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      type="button" 
                      className={`btn ${location.pathname === '/books' ? 'active' : ''}`} // Aktif olan sayfaya göre 'active' sınıfı ekliyoruz
                      onClick={navigateMyBooksPage}
                    >
                      My Books
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      type="button" 
                      className={`btn ${location.pathname === '/myprofile' ? 'active' : ''}`} // Aktif olan sayfaya göre 'active' sınıfı ekliyoruz
                      onClick={handleProfile}
                    >
                      My Profile
                    </button>
                  </li>
                  <li className='nav-item dropdown'>
                    <a className="nav-link dropdown-toggle" role='button' href='/' type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      {userName !== "User" ? (userName):(userEmail)}   {/* user email bilgisi varsa göster, yoksa 'User' olarak göster */}
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <button type="button" className="dropdown-item" onClick={handleLogout}>Log out</button>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-3">
                <Link to="/login" className={`btn btn-outline-dark ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
                <Link to="/register" className={`btn btn-outline-dark ${location.pathname === '/register' ? 'active' : ''}`}>Register</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
