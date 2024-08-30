import React from 'react';
import LoginForm from '../components/LoginForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useLocation } from 'react-router-dom';
import BookNotesNavBar from '../components/BookNotesNavBar';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const errorMessage = location.state?.error || '';

  return (
    <div className="LoginPage">
      <BookNotesNavBar/>
      <div className="container mt-5">
        <h1 className="josefin-sans-1">Login</h1>
        <div className="row">
          <LoginForm error={errorMessage} />
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
