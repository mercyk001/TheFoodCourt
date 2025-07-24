import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Container } from 'react-bootstrap';
import apiService from '../services/api';
import { useToast } from '../components/Toast';

export default function Menu({ onAddToCart }) {
  const [dishes, setDishes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', category: '', price: '' });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      
      // Fetch menus and restaurants in parallel
      const [menusResponse, restaurantsResponse] = await Promise.all([
        apiService.getMenus(),
        apiService.getRestaurants()
      ]);

      const menus = menusResponse.data || menusResponse;
      const restaurantList = restaurantsResponse.data || restaurantsResponse;
      
      setRestaurants(restaurantList);

      // Create a restaurant lookup map
      const restaurantMap = {};
      restaurantList.forEach(restaurant => {
        restaurantMap[restaurant.id] = restaurant;
      });

      // Enrich menu items with restaurant data
      const enrichedDishes = menus.map(menu => ({
        ...menu,
        restaurant: restaurantMap[menu.restaurant_id]?.name || 'Unknown Restaurant',
        cuisine: restaurantMap[menu.restaurant_id]?.cuisine_type || 'Unknown Cuisine'
      }));

      setDishes(enrichedDishes);
      setFiltered(enrichedDishes);
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (dish) => {
    // Call the parent's onAddToCart function
    if (onAddToCart) {
      onAddToCart(dish);
    }
    
    // Show custom toast notification
    showToast(
      `${dish.name} added to cart! KES ${dish.price?.toLocaleString()} • ${dish.restaurant}`,
      'success',
      3000
    );
  };

  useEffect(() => {
    let results = [...dishes];
    if (filters.cuisine) results = results.filter(d => d.cuisine === filters.cuisine);
    if (filters.category) results = results.filter(d => d.category === filters.category);
    if (filters.price === 'low') results = results.sort((a, b) => a.price - b.price);
    if (filters.price === 'high') results = results.sort((a, b) => b.price - a.price);
    setFiltered(results);
  }, [dishes, filters]);

  // Get unique values for filter options
  const uniqueCuisines = [...new Set(dishes.map(dish => dish.cuisine).filter(Boolean))];
  const uniqueCategories = [...new Set(dishes.map(dish => dish.category).filter(Boolean))];

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading menu items...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Browse Menu</h2>

      <Row className="mb-4">
        <Col md>
          <Form.Select 
            value={filters.cuisine}
            onChange={e => setFilters(f => ({ ...f, cuisine: e.target.value }))}
          >
            <option value="">Filter by Cuisine</option>
            {uniqueCuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select 
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          >
            <option value="">Filter by Category</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
        <div className="text-center py-5">
          <h4>No menu items found</h4>
          <p className="text-muted">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <Row className="g-4">
          {filtered.map(dish => (
            <Col key={dish.id} sm={6} lg={4} xl={3} className="mb-0">
              <Card 
                className="h-100 border-0 shadow-sm position-relative overflow-hidden"
                style={{
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }}
              >
                {dish.image_url && (
                  <div 
                    style={{ 
                      height: '160px', 
                      overflow: 'hidden',
                      borderRadius: '16px 16px 0 0'
                    }}
                  >
                    <Card.Img 
                      variant="top" 
                      src={dish.image_url} 
                      style={{ 
                        height: '100%', 
                        width: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                )}
                <Card.Body 
                  className="d-flex flex-column p-3"
                  style={{ minHeight: dish.image_url ? '140px' : '160px' }}
                >
                  <div className="mb-2">
                    <Card.Title 
                      className="mb-1 fw-bold" 
                      style={{ 
                        fontSize: '1rem',
                        lineHeight: '1.3',
                        color: '#2d3748'
                      }}
                    >
                      {dish.name}
                    </Card.Title>
                    <div 
                      className="d-flex align-items-center gap-1 mb-2"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: '#f7fafc',
                          color: '#4a5568',
                          fontWeight: '500',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {dish.cuisine}
                      </span>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: '#f0fff4',
                          color: '#38a169',
                          fontWeight: '500',
                          border: '1px solid #c6f6d5'
                        }}
                      >
                        {dish.category}
                      </span>
                    </div>
                  </div>
                  
                  {dish.description && (
                    <Card.Text 
                      className="text-muted small mb-2"
                      style={{ 
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {dish.description}
                    </Card.Text>
                  )}
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {dish.restaurant}
                      </small>
                      <div 
                        className="fw-bold"
                        style={{ 
                          fontSize: '1.1rem',
                          color: '#38a169'
                        }}
                      >
                        KES {dish.price?.toLocaleString()}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="w-100"
                      style={{
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        padding: '8px 16px',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleAddToCart(dish)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#38a169';
                        e.target.style.borderColor = '#38a169';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = '#38a169';
                        e.target.style.color = '#38a169';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Custom Toast Container */}
      <ToastContainer />
    </Container>
  );
}
