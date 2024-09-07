import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BweetNavBar from '../components/BweetNavBar';

const VerifyEmailPage: React.FC = () => {
  const [message, setMessage] = useState<string>('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const location = useLocation(); // Token'ı almak için kullanıyoruz
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search); // URL'den token'ı alıyoruz
      const token = params.get('token');

      if (!token) {
        setMessage('Invalid or missing token.');
        setIsSuccess(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_AUTH_ADDRESS}/api/verify-email?token=${token}`);
        if (response.data.success) {
          setMessage('Email verified successfully! Redirecting to login page...');
          setIsSuccess(true);

          // Bir süre sonra login sayfasına yönlendirme yap
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setMessage(response.data.message);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error('Email verification failed:', error);
        setMessage('Email verification failed. Please try again later.');
        setIsSuccess(false);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <>
      <BweetNavBar />
        <div className="verify-email-page d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h2>{isSuccess === true ? 'Success!' : 'Error!'}</h2>
          <p>{message}</p>
          {isSuccess === false && (
            <button onClick={() => navigate('/register')} className="btn btn-primary">
              Go to Register
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
