import React from 'react';
import RegisterForm from '../components/RegisterForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useLocation } from 'react-router-dom';
import BookNotesNavBar from '../components/BookNotesNavBar';

const RegisterPage: React.FC = () => {
  const location = useLocation();
  const errorMessage = location.state?.error || '';
  return (
    <div className="RegisterPage">
      <BookNotesNavBar/>
      <div className="container mt-5">
        <h1 className="josefin-sans-1">Register</h1>
        <div className="row justify-content-between">
          <RegisterForm error={errorMessage} />
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
