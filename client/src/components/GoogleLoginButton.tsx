import React from 'react';

const GoogleLoginButton: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_ADDRESS}/api/google`; // Google OAuth'a yönlendiriyoruz
  };

  return (
    <div className="d-flex justify-content-center my-3"> {/* Butonu ortalamak için kullanıyoruz */}
      <button className="btn btn-light btn-lg d-flex align-items-center shadow-sm border rounded-pill px-4 py-2" onClick={handleGoogleLogin} style={{ width: '100%', maxWidth: '300px' }}> {/* Buton genişliği sınırlandı */}
        <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google Logo" className="me-2" width="24" height="24"/>
        <span className="">Sign in with Google</span>
      </button>
    </div>
  );
};

export default GoogleLoginButton;
