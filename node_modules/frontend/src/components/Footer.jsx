import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToSection = (id) => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand">
            CIVIC<span className="brand-highlight">PORTAL</span>
          </Link>
          <p className="footer-desc">
            Empowering citizens to report, prioritize, and resolve civic issues. Better cities start with better reporting.
          </p>
        </div>
        
        <div className="footer-links-section">
          <h4>Platform</h4>
          <button onClick={() => scrollToSection('home')}>Home</button>
          <button onClick={() => scrollToSection('issues')}>Issues</button>
          <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
          <button onClick={() => scrollToSection('impact')}>About</button>
        </div>

        <div className="footer-links-section">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Register</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CivicPortal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
