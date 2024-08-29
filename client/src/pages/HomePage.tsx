import React from 'react';
import Header from '../components/Header';
import Jumbotron from '../components/Jumbotron';
import { useAuth } from '../contexts/AuthContext';  // useAuth hook'unu ekliyoruz
import axios from 'axios';

const HomePage: React.FC = () => {
  const { user, setUser } = useAuth();  // user ve setUser'ı alıyoruz

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="HomePage" data-bs-theme="dark">
      <Header user={user} onLogout={handleLogout} /> {/* Header prop'larını geçiyoruz */}
      <Jumbotron />
    </div>
  );
};

export default HomePage;
