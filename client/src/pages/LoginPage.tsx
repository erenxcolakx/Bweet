import React from 'react';
import LoginForm from '../components/LoginForm';
import GoogleLoginButton from '../components/GoogleLoginButton';

const LoginPage: React.FC = () => {
  return (
    <div className="LoginPage">
      <div className="container mt-5">
        <h1 className="josefin-sans-1">Login</h1>
        <div className="row">
          <LoginForm error="Your error message here" />
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
