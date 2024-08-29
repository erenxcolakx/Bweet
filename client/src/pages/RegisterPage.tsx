import React from 'react';
import RegisterForm from '../components/RegisterForm';
import GoogleLoginButton from '../components/GoogleLoginButton';

const RegisterPage: React.FC = () => {
  return (
    <div className="RegisterPage">
      <div className="container mt-5">
        <h1 className="josefin-sans-1">Register</h1>
        <div className="row justify-content-between">
          <RegisterForm error="Your error message here" />
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
