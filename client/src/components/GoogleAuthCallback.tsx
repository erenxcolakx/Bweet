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
        const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/check-auth`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setUser({
            user_id: response.data.user.user_id,
            email: response.data.user.email,
            name: response.data.user.name,
          });
          navigate('/books');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    // Kısa bir gecikme ekleyelim
    setTimeout(checkAuth, 1000);
  }, [navigate, setUser]);

  return <div>Redirecting...</div>;
};

export default GoogleAuthCallback;
