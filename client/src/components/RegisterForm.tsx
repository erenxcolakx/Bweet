import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [localError, setLocalError] = useState(error || ''); // localError state'i ekledik
  const navigate = useNavigate();

  useEffect(() => {
    // Sayfa yüklendiğinde hataları sıfırlıyoruz
    setPasswordError('');
    setLocalError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Şifre uzunluğu kontrolü
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return; // Şifre hatası varsa formu gönderme
    } else {
      setPasswordError('');
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_AUTH_ADDRESS}/api/register`, {
        username: email,
        password: password
      });

      if (response.data.success) {
        // Başarılı kayıt işlemi, kullanıcıyı giriş sayfasına yönlendir
        navigate('/login');
      } else {
        // Hata durumunda mesajı göster
        setLocalError(response.data.message);
      }
    } catch (error: any) {
      setLocalError(error.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="col-sm-8">
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="josefin-sans-1">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                name="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='username'
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="josefin-sans-1">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='current-password'
                minLength={8}
              />
              {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
            </div>
            {localError && <p style={{ color: 'red' }}>{localError}</p>} {/* Hata mesajı */}
            <div className="d-flex flex-row flex-wrap justify-content-between mt-2">
              <button type="submit" className="btn btn-warning">Register</button>
              <div className="d-flex g-2 justify-content-md-between flex-column flex-md-row" style={{ gap: '4px' }}>
                <h6 className="mt-3 pe-1 align-items-center josefin-sans-1 ps-2">Do you have an account?</h6>
                <a href="/login" className="btn btn-outline-warning align-self-center">Log in Here</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
