import React from 'react';
import Header from '../components/Header';
import HomePageComponent from '../components/HomePageComponent';

const HomePage: React.FC = () => {

  return (
    <div className="HomePage" data-bs-theme="light">
      <Header />
      <HomePageComponent />
    </div>
  );
};

export default HomePage;
