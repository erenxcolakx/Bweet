import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const maxAttempts = 5;
        let attempts = 0;

        const attemptCheck = async () => {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/check-auth`, {
            withCredentials: true
          });

          if (response.data.success) {
            setUser(response.data.user);
            navigate('/books');
          } else {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(attemptCheck, 1000); // Her 1 saniyede bir tekrar dene
            } else {
              navigate('/login');
            }
          }
        };

        setTimeout(attemptCheck, 3500); // İlk kontrolü 2 saniye sonra başlat
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, setUser]);

  return <div>Authenticating...</div>;
};

export default GoogleAuthCallback;
