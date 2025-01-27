import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // useAuth hook'unu ekliyoruz
import { useNavigate } from 'react-router-dom';
interface LoginFormProps {
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth(); // useAuth hook'u ile setUser fonksiyonuna erişiyoruz
  const navigate = useNavigate(); // useNavigate hook'unu kullanarak navigate fonksiyonunu alıyoruz

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/api/login`, {
        username: email,
        password: password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Login Response: ", response);

      if (response.data.success) {
        setUser(response.data.user);
        // Add a small delay before navigation
        setTimeout(() => {
          navigate('/books');
        }, 100);
      } else {
        navigate('/login', { state: { error: response.data.message } });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      navigate('/login', { state: { error: error.response?.data?.message || 'Login failed' } });
    }
  };

  return (
    <div className="col-12 col-md-8"> {/* Daha geniş bir alan sağlandı */}
      <div className="card shadow-sm"> {/* Gölge efekti eklendi */}
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
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
            <div className="form-group mb-3">
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
              />
            </div>
            {error && <p className='text-danger mt-2'>{error}</p>} {/* Hata mesajını kırmızı renkte göster */}
            <div className="d-flex flex-wrap justify-content-between mt-3 gap-2">
              <button type="submit" className="btn btn-warning px-4">Login</button>
              <a href="/register" className="btn btn-outline-warning px-4">Create Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
