import React from 'react';
import RegisterForm from '../components/RegisterForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useLocation } from 'react-router-dom';
import BweetNavBar from '../components/BweetNavBar';

const RegisterPage: React.FC = () => {
  const location = useLocation();
  const errorMessage = location.state?.error || '';
  return (
    <div className="RegisterPage">
      <BweetNavBar/>
      <div className="container d-flex flex-column justify-content-center align-items-center" style={{height: '600px'}}> {/* Tam ekran merkezleme */}
        <div className="w-100" style={{ maxWidth: '500px' }}> {/* Form genişliğini artırarak sınırlandır */}
          <h1 className="text-center josefin-sans-1 mb-3" style={{ fontSize: '3rem' }}>Register</h1>
          <div className="d-flex flex-column align-items-center gap-4"> {/* Elemanlar arasındaki boşluğu artır */}
            <div className='justify-content-center d-flex' style={{ width: '100%' }}>
              <RegisterForm error={errorMessage} />
            </div>
            <div style={{ width: '100%' }}>
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
