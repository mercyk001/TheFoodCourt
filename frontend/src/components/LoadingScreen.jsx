import React from 'react';

const LoadingScreen = () => {
  return (
    <div 
      className="d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa' 
      }}
    >
      <div className="text-center">
        <div 
          className="spinner-border text-primary mb-3" 
          role="status" 
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted">Loading Nextgen Food Court...</h5>
      </div>
    </div>
  );
};

export default LoadingScreen;
