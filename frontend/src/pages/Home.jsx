import React from 'react';
import { useNavigate } from 'react-router-dom';
import Herosection from '../components/Herosection';
import { Button, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import FeatureCards from '../components/FeatureCards';

// Mock outlets
const mockOutlets = [
  { id: 1, name: 'Mama Africa Kitchen', cuisine: 'Kenyan', description: 'Authentic Kenyan dishes with a home-cooked feel.' },
  { id: 2, name: 'Lagos Bites', cuisine: 'Nigerian', description: 'Spicy and delicious Nigerian classics.' },
  { id: 3, name: 'Congo Delights Bites', cuisine: 'Congolese', description: 'Flavor-packed Congolese specialties.' },
  { id: 4, name: 'Addis Taste', cuisine: 'Ethiopian', description: 'Traditional Ethiopian cuisine served fresh.' },
];

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
            <Button variant="outline-danger" size="lg" onClick={() => navigate('/menu')}>
              Browse  Menu
            </Button>
            <Button variant="outline-danger" size="lg" onClick={() => navigate('/tablebooking')}>
              Book a Table
            </Button>
          </div>
          <Container className="mt-5">
            <div className="row justify-content-center text-center text-white">
              <div className="col-4">
                <h2 className="fw-bold">25+</h2>
                <p className="text-bold-50">Food Outlets</p>
              </div>
              <div className="col-4">
                <h2 className="fw-bold">100+</h2>
                <p className="text-bold-50">Menu Items</p>
              </div>
              <div className="col-4">
                <h2 className="fw-bold">5</h2>
                <p className="text-bold-50">Cuisines</p>
              </div>
            </div>
          </Container>
        </Herosection>

        
        <div className="container-fluid px-0">
          <FeatureCards />
        </div>

        <section className="py-5">
          <Container>
            <div className="text-center mb-4">
              <h2 className="fw-bold">Featured Outlets</h2>
              <p className="text-muted">Discover authentic flavors from our partner restaurants</p>
            </div>
            <Row className="g-4">
              {mockOutlets.map((outlet) => (
                <Col key={outlet.id} md={6} lg={3}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Badge bg="dark" className="mb-2">{outlet.cuisine}</Badge>
                      <Card.Title>{outlet.name}</Card.Title>
                      <Card.Text className="text-muted">{outlet.description}</Card.Text>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 mt-3"
                        onClick={() => navigate('/menu')}
                      >
                        View Menu
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className="py-5 bg-light text-dark text-center">
          <Container>
            <h2 className="fw-bold mb-3">Ready to Order?</h2>
            <p className="mb-4">Skip the wait and order directly from your table or in advance</p>
            <Button size="lg" variant="dark" onClick={() => navigate('/tablebooking')}>
              Order Now
            </Button>
          </Container>
        </section>
      </main>
    </>
  );
}