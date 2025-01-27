import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BooksPage from './pages/BooksPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import MyProfilePage from './pages/MyProfilePage';
import PublicBooksPage from './pages/PublicBooksPage';
import UserPage from './pages/UserPage';
import BookPostsPage from './pages/BookPostsPage';
import GoogleAuthCallback from './components/GoogleAuthCallback';


// Korunan rotalar için bir bileşen oluşturuyoruz
const ProtectedRoute = ({ element: Element, ...rest }: { element: JSX.Element }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return user ? Element : null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path='/books' element={<ProtectedRoute element={<BooksPage />} />} />
          <Route path="/books/:title/:author" element={<ProtectedRoute element={<BookPostsPage />} />} />
          <Route path='/myprofile' element={<ProtectedRoute element={<MyProfilePage />} />} />
          <Route path='/home' element={<ProtectedRoute element={<PublicBooksPage />} />} />
          <Route path="/user/:id" element={<ProtectedRoute element={<UserPage />} />} />
          <Route path="/google/callback" element={<GoogleAuthCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
