import React from 'react';
import { Container, Button, Card, Row, Col, Form } from 'react-bootstrap';

function Cart({
  cartItems = [],        
  onAdd = () => {},
  onRemove = () => {},
  onClear = () => {},
  onPlaceOrder = () => {},
}) {
  
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cartItems.length === 0) {
    return (
      <Container className="text-center my-5">
        <i className="bi bi-cart" style={{ fontSize: '5rem', color: '#888' }}></i>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any delicious items to your cart yet.</p>
        <Button variant="dark" size="lg">Browse Menu</Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2>Your Order</h2>
      <Row>
        <Col md={8}>
          {cartItems.map(item => (
            <Card className="mb-3" key={item.id}>
              <Row className="g-0 align-items-center">
                <Col md={2}>
                  <Card.Img src={item.image} alt={item.name} />
                </Col>
                <Col md={6}>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.restaurant}</Card.Text>
                  </Card.Body>
                </Col>
                <Col md={4} className="text-end pe-4">
                  <Button variant="light" size="sm" onClick={() => onRemove(item)}>-</Button>
                  <span className="mx-2">{item.qty}</span>
                  <Button variant="light" size="sm" onClick={() => onAdd(item)}>+</Button>
                  <Card.Text className="mt-2 text-orange">KSh {item.price * item.qty}</Card.Text>
                </Col>
              </Row>
            </Card>
          ))}
        </Col>

        <Col md={4}>
          <Card className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Table Number (Optional)</Form.Label>
              <Form.Control placeholder="e.g., Table 15" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Special Instructions</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Any dietary requirements?" />
            </Form.Group>
            <hr />
            <div>
              {cartItems.map(item => (
                <div key={item.id} className="d-flex justify-content-between">
                  <span>{item.name} × {item.qty}</span>
                  <span>KSh {item.price * item.qty}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>KSh {total}</span>
              </div>
              <p className="text-muted small">Estimated prep time: 15‑25 minutes</p>
              <Button variant="dark" className="w-100 mb-2" onClick={onPlaceOrder}>
                Place Order – KSh {total}
              </Button>
              <Button variant="outline-secondary" className="w-100" onClick={onClear}>
                Clear Cart
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;
