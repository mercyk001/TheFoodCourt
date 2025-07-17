import React from 'react';
import { useNavigate } from 'react-router-dom';
import Herosection from '../components/Herosection';
import {  Button } from 'react-bootstrap';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      

     
      <main>
        <Herosection
          title="Welcome to Nextgen Food Court"
          subtitle="Experience the best of African and international cuisines all in one place. Order digitally, skip the chaos, and enjoy your meal!"
        >
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button variant="outline-danger" size="lg" onClick={() => navigate('/restaurant')}>
              Browse Restaurants
            </Button>
            <Button variant="outline-danger" size="lg" onClick={() => navigate('/tablebooking')}>
              Book a Table
            </Button>
          </div>
        </Herosection>
      </main>

    </>
  );
}
