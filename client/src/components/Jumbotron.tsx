import React from 'react';

const Jumbotron: React.FC = () => {
  return (
    <div className="jumbotron centered">
      <div className="container">
        <i className="fas fa-key fa-6x"></i>
        <h1 className="display-3 bodoni-moda-1">books</h1>
        <p className="lead bodoni-moda-1">
          a written or printed work consisting of pages glued or sewn together along one side and bound in covers. <br />
          there are many things to remember, log in to save them!
        </p>
        <hr />
        <a className="btn btn-warning btn-lg" style={{ backgroundColor: 'rgb(255, 145, 0)' }} href="/login" role="button">Login</a>
        <a className="btn btn-light btn-lg" href="/register" role="button">Register</a>
      </div>
    </div>
  );
};

export default Jumbotron;
