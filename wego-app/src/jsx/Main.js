import React from 'react';
import Header from './Header';
import '../css/Main.css';
import mainImage from '../images/main.jpeg';

function Main() {
  return (
    <div className="Main">
      <Header />
      <main className="hero-section">
        <div 
          className="hero-background" 
          style={{ backgroundImage: `url(${mainImage})` }}>
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Discover Amazing Places</h1>
          <p>Plan your perfect trip with curated recommendations.</p>
          <button className="hero-cta">Get Started</button>
        </div>
      </main>
    </div>
  );
}

export default Main;