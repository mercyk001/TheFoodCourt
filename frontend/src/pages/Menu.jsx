import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Container } from 'react-bootstrap';

export default function Menu({ onAddToCart }) {
  const [dishes, setDishes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', category: '', price: '' });

  useEffect(() => {
    fetch('http://localhost:8000/restaurants')
      .then(res => res.json())
      .then(data => {
        const allDishes = data.flatMap(restaurant =>
          Array.isArray(restaurant.menu)
            ? restaurant.menu.map(item => ({
                ...item,
                restaurant: restaurant.name,
                cuisine: restaurant.cuisine
              }))
            : []
        );
        setDishes(allDishes);
        setFiltered(allDishes);
      })
      .catch(err => console.error("Failed to fetch restaurants:", err));
  }, []);

  useEffect(() => {
    let results = [...dishes];
    if (filters.cuisine) results = results.filter(d => d.cuisine === filters.cuisine);
    if (filters.category) results = results.filter(d => d.category === filters.category);
    if (filters.price === 'low') results = results.sort((a, b) => a.price - b.price);
    if (filters.price === 'high') results = results.sort((a, b) => b.price - a.price);
    setFiltered(results);
  }, [dishes, filters]);

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Find Something Tasty!</h2>

      <Row className="mb-4">
        <Col md>
          <Form.Select onChange={e => setFilters(f => ({ ...f, cuisine: e.target.value }))}>
            <option value="">Filter by Cuisine</option>
            <option value="Kenyan">Kenyan</option>
            <option value="Ethiopian">Ethiopian</option>
            <option value="Nigerian">Nigerian</option>
            <option value="Congolese">Congolese</option>
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">Filter by Category</option>
            <option value="Main">Main</option>
            <option value="Snack">Snack</option>
            <option value="Kids">Kids</option>
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select onChange={e => setFilters(f => ({ ...f, price: e.target.value }))}>
            <option value="">Sort by Price</option>
            <option value="low">Lowest First</option>
            <option value="high">Highest First</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filtered.map(dish => (
          <Col key={dish.id} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={dish.img}
                style={{ height: '200px', objectFit: 'cover' }} />
              <Card.Body>
                <Card.Title>{dish.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {dish.cuisine} • {dish.category}
                </Card.Subtitle>
                <Card.Text><strong>From:</strong> {dish.restaurant}</Card.Text>
                <Card.Text>KES {dish.price}</Card.Text>
                <Button
                  variant="warning"
                  onClick={() => onAddToCart(dish)}
                >
                  Add to Cart
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}