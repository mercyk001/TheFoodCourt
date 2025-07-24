import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/LoginModal';

export default function Menu({ onAddToCart }) {
  const [dishes, setDishes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ cuisine: '', category: '', price: '' });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null); // Track which item is being added
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartButton, setShowCartButton] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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

  const handleAddToCart = async (dish) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to cart', 'warning');
      setShowLoginModal(true);
      return;
    }

    // Check if user is authenticated and is a customer for checkout
    if (isAuthenticated && user && user.role !== 'customer') {
      showToast('Only customers can add items to cart', 'error');
      return;
    }

    setAddingToCart(dish.id); // Set loading state for this specific item

    try {
      // Add to local cart for immediate UI feedback
      if (onAddToCart) {
        onAddToCart(dish);
      }
      
      showToast(`${dish.name} added to cart!`, 'success', 2000);

      // Show cart button temporarily
      setShowCartButton(true);
      setTimeout(() => setShowCartButton(false), 3000);

    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart. Please try again.', 'error');
    } finally {
      setAddingToCart(null); // Clear loading state
    }
  };

  useEffect(() => {
    let results = [...dishes];
    if (filters.cuisine) results = results.filter(d => d.cuisine === filters.cuisine);
    if (filters.category) results = results.filter(d => d.category === filters.category);
    if (filters.price === 'low') results = results.sort((a, b) => a.price - b.price);
    if (filters.price === 'high') results = results.sort((a, b) => b.price - a.price);
    setFiltered(results);
  }, [dishes, filters]);

  // Get available filter options based on current filtering state
  const getAvailableOptions = () => {
    // Start with all dishes, then apply other filters to get available options
    let baseResults = [...dishes];
    
    // For cuisine options, apply category filter but not cuisine filter
    let cuisineBase = [...dishes];
    if (filters.category) {
      cuisineBase = cuisineBase.filter(d => d.category === filters.category);
    }
    const availableCuisines = [...new Set(cuisineBase.map(dish => dish.cuisine).filter(Boolean))];
    
    // For category options, apply cuisine filter but not category filter
    let categoryBase = [...dishes];
    if (filters.cuisine) {
      categoryBase = categoryBase.filter(d => d.cuisine === filters.cuisine);
    }
    const availableCategories = [...new Set(categoryBase.map(dish => dish.category).filter(Boolean))];
    
    return { availableCuisines, availableCategories };
  };

  const { availableCuisines, availableCategories } = getAvailableOptions();

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
      <h2 className="text-center mb-4">Find Something Tasty!</h2>

      <Row className="mb-4">
        <Col md>
          <Form.Select 
            value={filters.cuisine}
            onChange={e => setFilters(f => ({ ...f, cuisine: e.target.value }))}
            style={{
              borderColor: '#D67F51',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#D67F51';
              e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">All Cuisines ({availableCuisines.length})</option>
            {availableCuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select 
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            style={{
              borderColor: '#D67F51',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#D67F51';
              e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">All Categories ({availableCategories.length})</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md>
          <Form.Select 
            value={filters.price}
            onChange={e => setFilters(f => ({ ...f, price: e.target.value }))}
            style={{
              borderColor: '#D67F51',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#D67F51';
              e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = 'none';
            }}
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
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(214, 127, 81, 0.15)';
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
                          backgroundColor: '#fdf2f8',
                          color: '#D67F51',
                          fontWeight: '500',
                          border: '1px solid #fed7d7'
                        }}
                      >
                        {dish.cuisine}
                      </span>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: '#fef5e7',
                          color: '#D67F51',
                          fontWeight: '500',
                          border: '1px solid #f6e05e'
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
                          color: '#D67F51'
                        }}
                      >
                        KES {dish.price?.toLocaleString()}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="w-100"
                      disabled={addingToCart === dish.id}
                      style={{
                        borderRadius: '8px',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        padding: '8px 16px',
                        transition: 'all 0.2s ease',
                        borderColor: '#D67F51',
                        color: '#D67F51'
                      }}
                      onClick={() => handleAddToCart(dish)}
                      onMouseEnter={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor = '#D67F51';
                          e.target.style.borderColor = '#D67F51';
                          e.target.style.color = 'white';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(214, 127, 81, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.target.disabled) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.borderColor = '#D67F51';
                          e.target.style.color = '#D67F51';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {addingToCart === dish.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding...
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={() => setShowLoginModal(false)} 
      />
      
      {/* Floating Cart Button */}
      {showCartButton && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}
        >
          <Button
            onClick={() => navigate('/cart')}
            style={{
              backgroundColor: '#D67F51',
              borderColor: '#D67F51',
              borderRadius: '50px',
              padding: '12px 24px',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 20px rgba(214, 127, 81, 0.4)',
              border: 'none',
              animation: 'pulse 2s infinite'
            }}
            className="d-flex align-items-center gap-2"
          >
            🛒 View Cart
          </Button>
        </div>
      )}
      
      <ToastContainer />
    </Container>
  );
}
