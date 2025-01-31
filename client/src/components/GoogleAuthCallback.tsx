import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from "jwt-decode";

interface User {
  user_id: string;
  email: string;
  name: string;
}

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Token'ı localStorage'a kaydet
    localStorage.setItem('token', token);
    
    // Axios default header'ına ekle
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      const decoded = jwtDecode(token) as User;
      setUser(decoded);
      navigate('/books');
    } catch (error) {
      console.error('Token decode failed:', error);
      navigate('/login');
    }
  }, [navigate, setUser]);

  return <div>Authenticating...</div>;
};

export default GoogleAuthCallback;
