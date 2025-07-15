import React from 'react';
import Herosection from '../components/Herosection';

export default function Restaurants() {
  return (
    <main>
      <Herosection
        title="Browse Our Restaurants"
        subtitle="Discover delicious meals from your favorite spots at Nextgen Mall."
      >
        <div className="container mt-5">
          <div className="row">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <h5 className="card-title">Restaurant {index + 1}</h5>
                    <p className="card-text text-muted">go to Menu</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Herosection>
    </main>
  );
}

