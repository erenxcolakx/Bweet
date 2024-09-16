import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReviewPage from './pages/ReviewPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BooksPage from './pages/BooksPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import MyProfilePage from './pages/MyProfilePage';
import PublicBooksPage from './pages/PublicBooksPage';
import UserPage from './pages/UserPage';
import BookReviewsPage from './pages/BookReviewsPage';


// Korunan rotalar için bir bileşen oluşturuyoruz
const ProtectedRoute = ({ element: Element, ...rest }: { element: JSX.Element }) => {
  const { user } = useAuth();

  return user ? Element : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Protected Route */}
          <Route path="/review" element={<ProtectedRoute element={<ReviewPage />} />} />
          <Route path='/books' element={<ProtectedRoute element={<BooksPage />} />} />
          <Route path="/books/:bookId" element={<ProtectedRoute element={<BookReviewsPage />} />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path='/myprofile' element={<MyProfilePage />} />
          <Route path='/home' element={<ProtectedRoute element={<PublicBooksPage />} />} />
          <Route path="/user/:id" element={<ProtectedRoute element={<UserPage />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
