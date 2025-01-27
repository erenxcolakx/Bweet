import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/api/check-auth`, {
      withCredentials: true, // Oturum çerezlerini gönder
    })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          // Kullanıcı bilgilerini auth context'e kaydet
          setUser({
            user_id: data.user.user_id,
            email: data.user.email,
            name: data.user.name,
          });

          // Ana sayfaya yönlendir
          navigate('/home');
        } else {
          // Başarısız giriş varsa login sayfasına yönlendir
          navigate('/login');
        }
      })
      .catch((error) => {
        console.error('Error during Google callback:', error);
        navigate('/login');
      });
  }, [navigate, setUser]);

  return <div>Loading...</div>;
};

export default GoogleAuthCallback;
