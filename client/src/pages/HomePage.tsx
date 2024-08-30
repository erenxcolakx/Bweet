import React from 'react';
import Header from '../components/Header';
import Jumbotron from '../components/Jumbotron';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // useNavigate'i ekliyoruz
import axios from 'axios';

const HomePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate(); // useNavigate'i kullanıyoruz

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/logout`);
      setUser(null);
      console.log('Logged out')
      navigate('/'); // useNavigate ile yönlendiriyoruz
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="HomePage" data-bs-theme="dark">
      <Header onLogout={handleLogout} /> {/* Header prop'larını geçiyoruz */}
      <Jumbotron />
    </div>
  );
};

export default HomePage;
