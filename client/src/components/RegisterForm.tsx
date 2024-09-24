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
      const response = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/register`, {
        username: email,
        password: password
      });

      if (response.data.success) {
        // Başarılı kayıt işlemi, kullanıcıyı giriş sayfasına yönlendir
        navigate('/login', {
          state: { error: 'Check your email to validate your account!' }
        });
      } else {
        // Hata durumunda mesajı göster
        setLocalError(response.data.message);
      }
    } catch (error: any) {
      setLocalError(error.response?.data?.message || 'An unexpected error occurred.');
    }
  };


  return (
    <div className="col-12 col-md-8"> {/* Genişliği artırdık */}
      <div className="card shadow-sm"> {/* Gölge eklendi */}
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3"> {/* Alt boşluk eklendi */}
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
            <div className="form-group mb-3"> {/* Alt boşluk eklendi */}
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
              {passwordError && <p className="text-danger mt-2">{passwordError}</p>} {/* Hata mesajı stilize edildi */}
            </div>
            {localError && <p className="text-danger mt-2">{localError}</p>} {/* Hata mesajı */}
            <div className="d-flex flex-wrap justify-content-between mt-3 gap-3"> {/* Butonlar arası boşluk artırıldı */}
              <button type="submit" className="btn btn-warning px-4">Register</button> {/* Düğme genişliği artırıldı */}
              <a href="/login" className="btn btn-outline-warning px-4">Log in Here</a> {/* İkinci düğme ile uyumlu yapıldı */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
