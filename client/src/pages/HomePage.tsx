import React from 'react';
import Header from '../components/Header';
import Jumbotron from '../components/Jumbotron';

const HomePage: React.FC = () => {


  return (
    <div className="HomePage" data-bs-theme="light">
      <Header /> {/* Header prop'larını geçiyoruz */}
      <Jumbotron />
    </div>
  );
};

export default HomePage;
