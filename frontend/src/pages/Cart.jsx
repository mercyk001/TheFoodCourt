import React, { useState } from 'react';
import {Container, Row, Col, Card, Button, Form, Image,} from 'react-bootstrap';
import {BsTrash, BsDash, BsPlus, BsClock, BsGeoAlt, BsArrowLeft,} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function Cart({
  cartItems,
  updateQuantity,
  removeItem,
  clearCart,
  getTotal,
}) {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const navigate = useNavigate();
  

  const handleQuantityChange = (id, newQty) => {
    if (newQty === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQty);
    }
  };

  const handleCheckout = () => {
    console.log('Order placed:', {
      cartItems,
      total: getTotal(),
      specialInstructions,
      tableNumber,
      timestamp: new Date().toISOString(),
    });

    clearCart();
    alert('Order placed successfully! You will receive a confirmation shortly.');
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };



  if (!cartItems || cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <BsTrash size={64} className="text-muted mb-4" />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any delicious items to your cart yet.</p>
        <Button variant="dark" onClick={handleBackToMenu}>
          Browse Menu
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4 d-flex align-items-center">
        <Button
          variant="link"
          className="text-dark d-flex align-items-center text-decoration-none"
          onClick={handleBackToMenu}
        >
          <BsArrowLeft className="me-2" /> Back to Menu
        </Button>
        <h2 className="mb-0 ms-3 fw-bold">Your Cart</h2>
      </div>
      <p className="text-muted ms-5 mb-4">
        {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart
      </p>

      <Row>
        <Col lg={8}>
          {cartItems.map((item) => (
            <Card className="mb-3" key={item.id}>
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Image
                      src={item.image}
                      fluid
                      rounded
                      style={{ height: '80px', width: '80px', objectFit: 'cover' }}
                    />
                  </Col>
                  <Col md={6}>
                    <h5>{item.name}</h5>
                    <small className="text-muted">{item.restaurant}</small>
                  </Col>
                  <Col md={4} className="text-end">
                    <div className="d-flex justify-content-end align-items-center mb-2">
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <BsDash />
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <BsPlus />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => removeItem(item.id)}
                      >
                        <BsTrash />
                      </Button>
                    </div>
                    <div className="text-orange fw-bold">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </div>
                    <small className="text-muted">
                      KSh {item.price.toLocaleString()} each
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header className="d-flex align-items-center gap-2">
              <BsGeoAlt /> Table Information
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Table Number (Optional)</Form.Label>
                <Form.Control
                  placeholder="e.g., Table 15"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Special Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Any special requests or dietary requirements..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>Order Summary</Card.Header>
            <Card.Body>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between small mb-2"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between fw-bold mb-2">
                <span>Total</span>
                <span className="text-orange">
                  KSh {getTotal().toLocaleString()}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted small bg-light p-2 rounded">
                <BsClock size={16} /> Estimated prep time: 15–25 minutes
              </div>
            </Card.Body>
            <Card.Footer>
              <Button
                className="w-100 mb-2"
                variant="dark"
                onClick={handleCheckout}
              >
                Place Order – KSh {getTotal().toLocaleString()}
              </Button>
              <Button className="w-100" variant="dark" onClick={clearCart}>
                Clear Cart
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}