import React from 'react';
import LoginForm from '../components/LoginForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useLocation } from 'react-router-dom';
import BweetNavBar from '../components/BweetNavBar';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const errorMessage = location.state?.error || '';

  return (
    <div className="LoginPage">
      <BweetNavBar />
      <div className="container d-flex flex-column justify-content-center align-items-center" style={{height: '600px'}}> {/* Tam ekran merkezleme */}
        <div className="w-100" style={{ maxWidth: '500px' }}> {/* Form genişliğini artırarak sınırlandır */}
          <h1 className="text-center josefin-sans-1 mb-3" style={{ fontSize: '3rem' }}>Login</h1> {/* Başlığı büyüt ve alt boşluğu artır */}
          <div className="d-flex flex-column align-items-center gap-4"> {/* Elemanlar arasındaki boşluğu artır */}
            <div className='justify-content-center d-flex' style={{ width: '100%' }}>
              <LoginForm error={errorMessage} />  {/* Login formu */}
            </div>
            <div style={{ width: '100%' }}>
              <GoogleLoginButton />  {/* Google ile giriş butonu */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
