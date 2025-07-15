import React from 'react';

export default function Home() {
  return (
    <section className="bg-light py-5 text-center position-relative">
      <div className="container">
        <h1 className="display-4 fw-bold">
          Welcome to <span className="text-danger">Nextgen Food Court</span>
        </h1>
        <p className="lead text-muted mb-4">
          Experience the best of African and international cuisines all in one place.
          Order digitally, skip the chaos, and enjoy your meal!
        </p>
        <div className="d-flex justify-content-center gap-3 mb-4">
          <button className="btn btn-danger btn-lg">Browse Menu</button>
          <button className="btn btn-outline-danger btn-lg">Book a Table</button>
        </div>
      </div>
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '-5%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,200,200,0.4), transparent)',
        borderRadius: '50%',
        zIndex: 0,
      }} />
    </section>
  );
}
