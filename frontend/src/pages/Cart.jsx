import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Image, Alert } from 'react-bootstrap';
import { BsTrash, BsDash, BsPlus, BsClock, BsGeoAlt, BsArrowLeft, BsCheckCircle } from 'react-icons/bs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { LoginModal } from '../components/LoginModal';
import apiService from '../services/api';

export default function Cart({ cartItems, updateQuantity, removeItem, clearCart, onCartUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [userReservations, setUserReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, checkAuthStatus } = useAuth();
  const { showToast, ToastContainer } = useToast();

  // Check if cart has items that were restored from storage
  useEffect(() => {
    const hasOldItems = cartItems.some(item => {
      const itemAge = Date.now() - (item.addedAt || 0);
      return itemAge > 5 * 60 * 1000; // Show notice if any item is older than 5 minutes
    });
    
    if (hasOldItems && cartItems.length > 0) {
      setShowRestoredNotice(true);
      // Auto-hide the notice after 10 seconds
      const timer = setTimeout(() => setShowRestoredNotice(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  useEffect(() => {
    // Load user reservations when component mounts if authenticated
    if (isAuthenticated) {
      fetchUserReservations();
    }
    
    // Check if user is returning from booking
    if (searchParams.get('booked') === 'true') {
      showToast('Table booked successfully! You can now place your order.', 'success', 4000);
      // Force refresh reservations immediately when returning from booking
      setTimeout(() => {
        if (isAuthenticated) {
          fetchUserReservations();
        }
      }, 1000);
      // Remove the parameter from URL
      setSearchParams({});
    }
  }, [isAuthenticated, searchParams, setSearchParams]);

  // Also refresh reservations when user navigates back to cart (e.g., after booking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Small delay to ensure any backend updates are reflected
        setTimeout(() => {
          fetchUserReservations();
        }, 500);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  const fetchUserReservations = async () => {
    try {
      setLoadingReservations(true);
      console.log('Fetching user reservations...');
      const response = await apiService.getCustomerReservations();
      const reservationsData = response.data || response;
      
      console.log('Raw reservations data:', reservationsData);
      
      // Handle nested data structure
      const reservationsList = Array.isArray(reservationsData) ? reservationsData : (reservationsData.data || []);
      console.log('Reservations list:', reservationsList);
      
      // Filter for active reservations (today and future dates)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeReservations = Array.isArray(reservationsList) 
        ? reservationsList.filter(reservation => {
            const reservationDate = new Date(reservation.reservation_time);
            console.log('Checking reservation:', {
              id: reservation.id,
              reservation_time: reservation.reservation_time,
              status: reservation.status,
              table_number: reservation.table_number,
              parsedDate: reservationDate,
              isDateValid: !isNaN(reservationDate.getTime()),
              isFutureDate: reservationDate >= today,
              todayDate: today
            });
            // Accept 'confirmed' or 'pending' status
            const hasValidStatus = reservation.status === 'confirmed' || reservation.status === 'pending';
            const isFutureDate = reservationDate >= today;
            console.log('Filter result:', { hasValidStatus, isFutureDate, willInclude: hasValidStatus && isFutureDate });
            return hasValidStatus && isFutureDate;
          })
        : [];
      
      console.log('Filtered active reservations:', activeReservations);
      
      // Sort by date and time, earliest first (next upcoming)
      const sortedReservations = activeReservations.sort((a, b) => {
        const dateA = new Date(a.reservation_time);
        const dateB = new Date(b.reservation_time);
        return dateA - dateB;
      });
      
      console.log('Final sorted reservations:', sortedReservations);
      setUserReservations(sortedReservations);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      setUserReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCurrentCartItems = () => {
    return cartItems;
  };

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty === 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQty);
    }
    // Update the cart count in the parent component
    if (onCartUpdate) {
      const updatedItems = newQty === 0 
        ? cartItems.filter(item => item.id !== itemId)
        : cartItems.map(item => item.id === itemId ? { ...item, quantity: newQty } : item);
      onCartUpdate(updatedItems);
    }
  };

  const handleCheckout = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast('Please log in to place an order', 'warning');
      setShowLoginModal(true);
      return;
    }

    // Check if user is a customer
    if (user && user.role !== 'customer') {
      showToast('Only customers can place orders', 'error');
      return;
    }

    // Check if user has any confirmed reservations
    if (userReservations.length === 0) {
      showToast('You must book a table reservation first before placing an order', 'warning');
      navigate('/tablebooking?return=cart');
      return;
    }

    const currentItems = getCurrentCartItems();
    if (currentItems.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get unique restaurants from cart items
      const restaurants = [...new Set(currentItems.map(item => item.restaurant_id).filter(Boolean))];
      
      if (restaurants.length === 0) {
        // Try to get restaurant from meal data or other fields
        const altRestaurants = [...new Set(currentItems.map(item => item.restaurant || item.restaurant_id || item.meal?.restaurant_id).filter(Boolean))];
        
        if (altRestaurants.length === 0) {
          showToast('Unable to determine restaurant for order items', 'error');
          return;
        }
        restaurants.push(...altRestaurants);
      }
      
      if (restaurants.length > 1) {
        showToast('All items must be from the same restaurant', 'error');
        return;
      }

      // Use the next upcoming reservation
      const activeReservation = userReservations[0];

      // Create order payload
      const orderData = {
        items: currentItems.map(item => ({
          meal_id: item.meal_id || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        restaurant_id: restaurants[0],
        special_instructions: specialInstructions,
        table_id: activeReservation.table_id,
        reservation_id: activeReservation.id,
        total: getTotal()
      };

      const response = await apiService.createOrder(orderData);
      
      // Prepare success message
      let successMessage = `Order placed successfully! Your order will be ready in approximately ${response.estimated_serving_time_minutes || 20} minutes.`;
      
      if (response.table_info) {
        successMessage += ` You have been assigned Table ${response.table_info.table_number}.`;
      } else if (activeReservation.table_number) {
        successMessage += ` Your order will be served at Table ${activeReservation.table_number}.`;
      }
      
      showToast(successMessage, 'success', 5000);
      
      // Clear cart and update parent
      clearCart();
      if (onCartUpdate) {
        onCartUpdate([]);
      }
      
      navigate('/orders');
      
    } catch (error) {
      console.error('Error during checkout:', error);
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    showToast('Login successful!', 'success');
    
    // Force re-check authentication status
    if (checkAuthStatus) {
      await checkAuthStatus();
    }
    
    // Fetch user reservations after login
    fetchUserReservations();
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  // Authentication check - but still allow guest cart viewing
  if (!isAuthenticated) {
    // Show cart items but require login for checkout
    const currentItems = getCurrentCartItems();
    if (!currentItems || currentItems.length === 0) {
      return (
        <Container className="py-5">
          <div className="text-center py-5">
            <div className="mb-4">
              <BsTrash size={64} style={{ color: '#D67F51' }} />
            </div>
            <h3 className="mb-3" style={{ color: '#D67F51' }}>Your cart is empty</h3>
            <p className="text-muted mb-4">Looks like you haven't added any delicious items to your cart yet.</p>
            <Button 
              style={{
                backgroundColor: '#D67F51',
                borderColor: '#D67F51',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: '500'
              }}
              onClick={handleBackToMenu}
            >
              Browse Menu
            </Button>
          </div>
          <ToastContainer />
        </Container>
      );
    }
    // Continue to show cart with login modal for checkout
  }

  // Role check
  if (isAuthenticated && user && user.role !== 'customer') {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <BsGeoAlt size={64} style={{ color: '#D67F51' }} />
          </div>
          <h3 className="mb-3" style={{ color: '#D67F51' }}>Customer Account Required</h3>
          <p className="text-muted mb-4">Only customers can access the shopping cart.</p>
          <Button 
            variant="outline-secondary"
            style={{
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '500'
            }}
            onClick={() => navigate('/menu')}
          >
            Browse Menu
          </Button>
        </div>
      </Container>
    );
  }

  // Empty cart
  const currentItems = getCurrentCartItems();
  if (!currentItems || currentItems.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <BsTrash size={64} style={{ color: '#D67F51' }} />
          </div>
          <h3 className="mb-3" style={{ color: '#D67F51' }}>Your cart is empty</h3>
          <p className="text-muted mb-4">Looks like you haven't added any delicious items to your cart yet.</p>
          <Button 
            style={{
              backgroundColor: '#D67F51',
              borderColor: '#D67F51',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '500'
            }}
            onClick={handleBackToMenu}
          >
            Browse Menu
          </Button>
        </div>
        <ToastContainer />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center">
        <Button
          variant="link"
          className="d-flex align-items-center text-decoration-none p-0"
          onClick={handleBackToMenu}
          style={{ color: '#D67F51' }}
        >
          <BsArrowLeft className="me-2" size={20} /> Back to Menu
        </Button>
        <h2 className="mb-0 ms-3 fw-bold" style={{ color: '#2c3e50' }}>Your Cart</h2>
      </div>
      <p className="text-muted ms-5 mb-4">
        {currentItems.length} item{currentItems.length > 1 ? 's' : ''} in your cart
      </p>

      {/* Restored Cart Notice */}
      {showRestoredNotice && (
        <Alert 
          variant="info" 
          className="mx-5 mb-4 d-flex align-items-center"
          dismissible
          onClose={() => setShowRestoredNotice(false)}
          style={{
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            borderLeft: '4px solid #0d6efd'
          }}
        >
          <BsCheckCircle className="me-2" style={{ color: '#0d6efd' }} />
          <span>
            <strong>Cart Restored:</strong> Your previous cart items have been restored. 
            Items are automatically saved and will expire after 24 hours.
          </span>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          {currentItems.map((item) => (
            <Card 
              className="mb-3 border-0 shadow-sm" 
              key={item.id}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              }}
            >
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={2}>
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div 
                        className="d-flex align-items-center justify-content-center rounded"
                        style={{
                          height: '80px',
                          backgroundColor: 'rgba(214, 127, 81, 0.1)',
                          color: '#D67F51'
                        }}
                      >
                        <BsCheckCircle size={32} />
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    <h5 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>{item.name}</h5>
                    <p className="text-muted mb-2 small">{item.description}</p>
                    <div className="text-muted small">
                      KES {item.price.toLocaleString()} each
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <div className="d-flex justify-content-end align-items-center mb-3">
                      <Button
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        style={{
                          backgroundColor: 'transparent',
                          border: `2px solid #D67F51`,
                          color: '#D67F51',
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <BsDash />
                      </Button>
                      <span 
                        className="mx-3 fw-bold"
                        style={{ 
                          minWidth: '30px',
                          textAlign: 'center',
                          fontSize: '16px',
                          color: '#2c3e50'
                        }}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        style={{
                          backgroundColor: '#D67F51',
                          border: `2px solid #D67F51`,
                          color: 'white',
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <BsPlus />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-3"
                        onClick={() => handleQuantityChange(item.id, 0)}
                        style={{
                          borderRadius: '8px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <BsTrash />
                      </Button>
                    </div>
                    <div className="fw-bold" style={{ fontSize: '18px', color: '#D67F51' }}>
                      KES {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col lg={4}>
          {/* Reservation Status Card */}
          <Card 
            className="mb-4 border-0 shadow-sm"
            style={{ borderRadius: '16px' }}
          >
            <Card.Header 
              className="d-flex align-items-center gap-2 border-0"
              style={{ 
                backgroundColor: 'rgba(214, 127, 81, 0.1)',
                color: '#D67F51',
                borderRadius: '16px 16px 0 0',
                padding: '16px 20px'
              }}
            >
              <BsGeoAlt /> Reservation Status
            </Card.Header>
            <Card.Body className="p-4">
              {loadingReservations ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: '#D67F51' }}></div>
                  <span className="text-muted">Checking reservations...</span>
                </div>
              ) : userReservations.length > 0 ? (
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <BsCheckCircle className="me-2" style={{ color: '#28a745' }} />
                    <span className="fw-medium" style={{ color: '#28a745' }}>
                      You have active reservations
                    </span>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                    <div className="fw-medium mb-2">Next Reservation:</div>
                    <div className="small text-muted">
                      <div>Date: {new Date(userReservations[0].reservation_time).toLocaleDateString()}</div>
                      <div>Time: {new Date(userReservations[0].reservation_time).toLocaleTimeString()}</div>
                      <div>Table: {userReservations[0].table_number}</div>
                      <div>Guests: {userReservations[0].members_count}</div>
                      <div>Status: {userReservations[0].status}</div>
                    </div>
                  </div>
                  {userReservations.length > 1 && (
                    <div className="mt-2 text-muted small">
                      + {userReservations.length - 1} more reservation{userReservations.length > 2 ? 's' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Alert variant="warning" className="mb-3">
                    <strong>Reservation Required</strong><br />
                    You must book a table reservation before placing an order.
                  </Alert>
                  <Button
                    className="w-100"
                    style={{
                      backgroundColor: '#D67F51',
                      borderColor: '#D67F51',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontWeight: '500'
                    }}
                    onClick={() => navigate('/tablebooking?return=cart')}
                  >
                    Book a Table
                  </Button>
                </div>
              )}
              
              <hr style={{ borderColor: 'rgba(214, 127, 81, 0.2)', margin: '20px 0' }} />
              
              <Form.Group>
                <Form.Label className="fw-medium mb-2">Special Instructions (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Any special requests or dietary requirements..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  style={{
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    padding: '12px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#D67F51';
                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Order Summary Card */}
          <Card 
            className="border-0 shadow-sm"
            style={{ borderRadius: '16px' }}
          >
            <Card.Header 
              className="border-0"
              style={{ 
                backgroundColor: 'rgba(214, 127, 81, 0.1)',
                color: '#D67F51',
                borderRadius: '16px 16px 0 0',
                padding: '16px 20px',
                fontWeight: '600'
              }}
            >
              Order Summary
            </Card.Header>
            <Card.Body className="p-4">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between small mb-2"
                  style={{ color: '#6b7280' }}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="fw-medium">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <hr style={{ borderColor: 'rgba(214, 127, 81, 0.2)' }} />
              <div className="d-flex justify-content-between fw-bold mb-3" style={{ fontSize: '18px' }}>
                <span style={{ color: '#2c3e50' }}>Total</span>
                <span style={{ color: '#D67F51' }}>
                  KES {getTotal().toLocaleString()}
                </span>
              </div>
              <div 
                className="d-flex align-items-center gap-2 text-muted small p-3 rounded mb-3"
                style={{ backgroundColor: 'rgba(214, 127, 81, 0.1)' }}
              >
                <BsClock size={16} style={{ color: '#D67F51' }} /> 
                <span>Estimated prep time: 15–25 minutes</span>
              </div>
            </Card.Body>
            <Card.Footer 
              className="border-0"
              style={{ 
                backgroundColor: 'transparent',
                borderRadius: '0 0 16px 16px',
                padding: '20px'
              }}
            >
              <Button
                className="w-100 mb-3"
                disabled={submitting || currentItems.length === 0 || (!isAuthenticated || userReservations.length === 0)}
                onClick={handleCheckout}
                style={{
                  backgroundColor: '#D67F51',
                  borderColor: '#D67F51',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#c56742';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(214, 127, 81, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#D67F51';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : !isAuthenticated ? (
                  'Login to Place Order'
                ) : userReservations.length === 0 ? (
                  'Book Table First'
                ) : (
                  `Place Order – KES ${getTotal().toLocaleString()}`
                )}
              </Button>
              <Button 
                className="w-100" 
                variant="outline-secondary"
                onClick={() => {
                  clearCart();
                  if (onCartUpdate) {
                    onCartUpdate([]);
                  }
                  showToast('Cart cleared successfully', 'success');
                }}
                disabled={submitting || currentItems.length === 0}
                style={{
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: '500',
                  borderColor: '#e2e8f0',
                  color: '#6b7280'
                }}
              >
                Clear Cart
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Toast Container */}
      <ToastContainer />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </Container>
  );
}
