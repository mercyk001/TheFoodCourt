import React from 'react';
import { useNavigate } from 'react-router-dom';
import Herosection from '../components/Herosection';
import { Button, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import FeatureCards from '../components/FeatureCards';


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
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/menu')}>
              Browse  Menu
            </Button>
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/tablebooking')}>
              Book a Table
            </Button>
          </div>
        </Herosection>

        
        <div className="container-fluid px-0">
          <FeatureCards />
        </div>

        

        <section className="py-5 bg-light text-dark text-center">
          <Container>
            <h2 className="fw-bold mb-3">Ready to Order?</h2>
            <p className="mb-4">Skip the wait and order directly from your table or in advance</p>
            <Button size="lg"  onClick={() => navigate('/tablebooking')}>
              Order Now
            </Button>
          </Container>
        </section>
      </main>
    </>
  );
}
