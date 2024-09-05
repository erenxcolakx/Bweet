import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
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
          <Route path="/verify-email" element={<VerifyEmailPage />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
