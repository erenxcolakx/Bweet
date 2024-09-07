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
      const response = await axios.post(`${process.env.REACT_APP_AUTH_ADDRESS}/api/login`, {
        username: email,
        password: password
      }, {
        withCredentials: true
      });
      console.log("Login Response: ", response);
      if (response.data.success) {
        setUser(response.data.user);
        navigate('/books');
      } else {
        navigate('/login', { state: { error: response.data.message } });
      }
    } catch (error: any) {
      console.error('There was an error!', error);
      navigate('/login', { state: { error: error.response.data.message } });
    }
  };

  return (
    <>
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
                />
              </div>
              {error && <p className='mt-2'>{error}</p>}
              <div className="d-flex flex-wrap justify-content-between mt-2 gap-2">
                <button type="submit" className="btn btn-warning">Login</button>
                <a href="/register" className="btn btn-outline-warning">Create Account</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
