import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // useAuth hook'unu ekliyoruz

interface LoginFormProps {
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth(); // useAuth hook'u ile setUser fonksiyonuna erişiyoruz

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/login', {
        username: email,
        password: password
      });

      // Backend'den gelen cevaba göre yönlendirme yapıyoruz ve global state'i güncelliyoruz
      if (response.data.success) {
        setUser(response.data.user); // Global state'i güncelliyoruz
        window.location.href = '/books';
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('There was an error!', error);
      alert('Login failed: ' + error.message);
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
                type="email"
                className="form-control"
                name="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="josefin-sans-1">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p>{error}</p>}
            <div className="d-flex flex-wrap justify-content-between mt-2 gap-2">
              <button type="submit" className="btn btn-warning">Login</button>
              <a href="/register" className="btn btn-outline-warning">Create Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
