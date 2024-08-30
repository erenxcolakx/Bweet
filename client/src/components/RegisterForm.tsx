import React, { useState } from 'react';
import axios from 'axios';

interface RegisterFormProps {
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_AUTH_ADDRESS}/api/register`, {
        username: email,
        password: password
      });

      if (response.data.success) {
        // Başarılı kayıt işlemi, kullanıcıyı giriş sayfasına yönlendir
        window.location.href = '/login';
      } else {
        // Hata durumunda mesajı göster
        alert('Registration failed: ' + response.data.message);
      }
    } catch (error:any) {
      console.error('There was an error!', error);
      alert('Registration failed: ' + error.message);
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
            <div className="d-flex flex-row flex-wrap justify-content-between mt-2">
              <button type="submit" className="btn btn-warning">Register</button>
              <div className="d-flex g-2 justify-content-md-between flex-column flex-md-row" style={{ gap: '4px' }}>
                <h6 className="mt-3 pe-1 align-items-center josefin-sans-1 ps-2">Do you have an account?</h6>
                <a href="/login" className="btn btn-outline-warning">Log in Here</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
