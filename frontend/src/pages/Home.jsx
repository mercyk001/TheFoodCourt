import React from 'react';
import { useNavigate } from 'react-router-dom';
import Herosection from '../components/Herosection';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main>
      <Herosection
        title="Welcome to Nextgen Food Court"
        subtitle="Experience the best of African and international cuisines all in one place. Order digitally, skip the chaos, and enjoy your meal!"
      >
        <div className="d-flex justify-content-center gap-3">
          <button className="btn btn-danger btn-lg" onClick={() => navigate('/restaurant')}>
            Browse Restaurants
          </button>
          <button className="btn btn-outline-danger btn-lg">Book a Table</button>
        </div>
      </Herosection>
    </main>
  );
}
