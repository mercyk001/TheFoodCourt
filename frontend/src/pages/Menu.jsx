import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Container, Spinner, Alert } from 'react-bootstrap';

export default function Menu({ onAddToCart }) {
  const [dishes, setDishes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', category: '', price: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/menus')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch menu items');
        return res.json();
      })
      .then(data => {
        // Data is already flat from the Flask API
        console.log('Fetched dishes:', data);
        setDishes(data);
        setFiltered(data);
      })
      .catch(err => {
        console.error("Failed to fetch menu items:", err);
        setError("Failed to load menu items. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = [...dishes];
    
    if (filters.cuisine) {
      results = results.filter(d => d.cuisine === filters.cuisine);
    }
    
    if (filters.category) {
      results = results.filter(d => d.category === filters.category);
    }
    
    if (filters.price === 'low') {
      results = results.sort((a, b) => a.price - b.price);
    } else if (filters.price === 'high') {
      results = results.sort((a, b) => b.price - a.price);
    }
    
    setFiltered(results);
  }, [dishes, filters]);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading delicious meals...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Find Something Tasty!</h2>

      <Row className="mb-4">
        <Col md>
          <Form.Select 
            value={filters.cuisine}
            onChange={e => setFilters(f => ({ ...f, cuisine: e.target.value }))}
          >
            <option value="">Filter by Cuisine</option>
            <option value="Kenyan">Kenyan</option>
            <option value="Ethiopian">Ethiopian</option>
            <option value="Nigerian">Nigerian</option>
            <option value="Congolese">Congolese</option>
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select 
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">Filter by Category</option>
            <option value="Main">Main</option>
            <option value="Snack">Snack</option>
            <option value="Kids">Kids</option>
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select 
            value={filters.price}
            onChange={e => setFilters(f => ({ ...f, price: e.target.value }))}
          >
            <option value="">Sort by Price</option>
            <option value="low">Lowest First</option>
            <option value="high">Highest First</option>
          </Form.Select>
        </Col>
      </Row>

      {filtered.length === 0 ? (
        <Alert variant="info" className="text-center">
          No dishes found matching your criteria. Try adjusting your filters.
        </Alert>
      ) : (
        <Row>
          {filtered.map(dish => (
            <Col key={dish.id} sm={6} md={4} lg={3} className="mb-4">
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={dish.img || '/placeholder-food.jpg'}
                  onError={(e) => {
                    e.target.src = '/placeholder-food.jpg';
                  }}
                  style={{ height: '200px', objectFit: 'cover' }} 
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{dish.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {dish.cuisine} • {dish.category}
                  </Card.Subtitle>
                  <Card.Text><strong>From:</strong> {dish.restaurant}</Card.Text>
                  <Card.Text className="mb-3">
                    <strong>KES {dish.price.toLocaleString()}</strong>
                  </Card.Text>
                  <Button
                    variant="warning"
                    className="mt-auto"
                    onClick={() => onAddToCart(dish)}
                  >
                    Add to Cart
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}