import React from 'react';

const Jumbotron: React.FC = () => {
  return (
    <div className="jumbotron centered">
      <div className="container">
        <i className="fas fa-key fa-6x"></i>
        <h1 className="display-3 bodoni-moda-1">books</h1>
        <p className="lead">
          a written or printed work consisting of pages glued or sewn together along one side and bound in covers. <br />
          there are many things to remember, log in to save and share them!
        </p>
      </div>
    </div>
  );
};

export default Jumbotron;
