import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Utensils, ShoppingCart, AlarmClock, Smile } from 'lucide-react';

const features = [
  {
    title: 'Easy Ordering',
    description: 'Browse menus and place orders with just a few clicks.',
    icon: ShoppingCart,
  },
  {
    title: 'Wide Variety',
    description: 'Enjoy local and international dishes from top vendors.',
    icon: Utensils,
  },
  {
    title: 'Fast Pickup',
    description: 'Get notified when your food is ready for pickup.',
    icon: AlarmClock,
  },
  {
    title: 'Great Experience',
    description: 'Skip long lines and enjoy your food stress-free.',
    icon: Smile,
  },
];

export default function FeatureCards() {
  return (
    <section className="py-5 bg-light">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Why Choose Us?</h2>
        <p className="text-muted">Your smart and hassle-free food court experience.</p>
      </div>
      <Row className="g-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Col key={idx} md={6} lg={3}>
              <Card className="text-center h-100 shadow-sm">
                <Card.Body>
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: 60, height: 60 }}
                  >
                    <Icon size={28} />
                  </div>
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text className="text-muted">{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}
