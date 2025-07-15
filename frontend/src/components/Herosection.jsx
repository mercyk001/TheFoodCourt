import React from 'react';

export default function Herosection({ title, subtitle, children }) {
  return (
    <section
      className="text-white text-center d-flex align-items-center"
      style={{
        backgroundImage: "url('https://images.pexels.com/photos/31167966/pexels-photo-31167966.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative',
        padding: '4rem 1rem',
      }}
    >
      <div
        className="container"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '2rem', borderRadius: '10px' }}
      >
        <h1 className="display-4 fw-bold">{title}</h1>
        <p className="lead mb-4">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
