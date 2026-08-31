import React from 'react';
import './CinematicLoader.css';

const CinematicLoader = ({ progress }) => {
  return (
    <div className="cinematic-loader">
      <div className="loader-content">
        <h1 className="loader-title">ENTERING THE CITY...</h1>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="loader-percentage">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default CinematicLoader;
