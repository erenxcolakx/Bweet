import React from 'react';

const GoogleLoginButton: React.FC = () => {
  return (
    <div className="col-sm-4">
      <div className="card">
        <div className="card-body">
          <a className="btn btn-block" href="/auth/google" role="button">
            <i className="fab fa-google"></i>
            <h3 className="josefin-sans-1 mt-2">Sign In with Google</h3>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
