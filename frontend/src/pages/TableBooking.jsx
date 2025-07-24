import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Container, Alert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Herosection from '../components/Herosection';
import apiService from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

export default function TableBooking() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '',
    guests: '',
    specialRequests: ''
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingTables, setCheckingTables] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToCart = searchParams.get('return') === 'cart';

  // Auto-fill user details when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.username || user.name || '',
        email: user.email || '',
        phoneNumber: user.phone || user.phone_number || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const display = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: time, display });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Load tables initially with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Load tables with today's date initially
    loadInitialTables(today);
  }, []);

  // Check available tables when date, time, and guests are selected
  useEffect(() => {
    if (formData.date && formData.guests) {
      checkAvailableTables();
    } else if (formData.date) {
      // If only date is selected, show all tables for that date
      checkAvailableTables();
    }
  }, [formData.date, formData.time, formData.guests]);

  const loadInitialTables = async (date) => {
    try {
      setCheckingTables(true);
      const response = await apiService.getAvailableTables(date);
      const tables = response.data || response;
      setAvailableTables(tables);
    } catch (error) {
      console.error('Error loading initial tables:', error);
      setAvailableTables([]);
    } finally {
      setCheckingTables(false);
    }
  };

  const checkAvailableTables = async () => {
    try {
      setCheckingTables(true);
      
      // Get tables with availability info
      const response = await apiService.getAvailableTables(
        formData.date, 
        formData.time, 
        formData.guests
      );
      const tables = response.data || response;
      
      // If specific time is selected, filter tables available at that time
      if (formData.time) {
        const availableAtTime = tables.filter(table => 
          table.available_at_requested_time || 
          (table.available_time_slots && table.available_time_slots.includes(formData.time))
        );
        setAvailableTables(availableAtTime);
      } else {
        // Show all tables with their available time slots
        setAvailableTables(tables);
      }
      
      setSelectedTable(null); // Reset selected table when checking new availability
    } catch (error) {
      console.error('Error checking available tables:', error);
      showToast('Failed to check available tables. Please try again.', 'error');
      setAvailableTables([]);
    } finally {
      setCheckingTables(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast('Please log in to make a reservation.', 'error');
      return;
    }

    // Check if user is a customer
    if (user && user.role !== 'customer') {
      showToast('Only customers can make reservations.', 'error');
      return;
    }
    
    if (!selectedTable) {
      showToast('Please select a table before making your reservation.', 'error');
      return;
    }

    // If no time is selected, use the first available time slot for the selected table
    let reservationTime = formData.time;
    if (!reservationTime) {
      if (selectedTable.available_time_slots && selectedTable.available_time_slots.length > 0) {
        reservationTime = selectedTable.available_time_slots[0];
        showToast(`Auto-selected time: ${new Date(`2000-01-01T${reservationTime}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`, 'info', 3000);
      } else {
        showToast('Please select a specific time for your reservation.', 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Combine date and time into a single datetime string
      const reservationDateTime = `${formData.date}T${reservationTime}:00`;
      
      const reservationData = {
        table_id: selectedTable.id,
        reservation_time: reservationDateTime,
        duration: 120, // Default 2 hours
        members_count: parseInt(formData.guests),
        status: 'confirmed' // Auto-confirm reservations for customers
      };

      const response = await apiService.createReservation(reservationData);
      
      showToast(
        `Reservation created successfully! Table ${selectedTable.table_number} reserved for ${formData.guests} guests at ${new Date(`2000-01-01T${reservationTime}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}.`,
        'success',
        5000
      );
      
      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        date: '',
        time: '',
        guests: '',
        specialRequests: ''
      });
      setAvailableTables([]);
      setSelectedTable(null);
      
      // Redirect back to cart if that's where user came from
      if (returnToCart) {
        setTimeout(() => {
          navigate('/cart?booked=true');
        }, 2000); // Give time for user to see success message
      }
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showToast('Your session has expired. Please log in again to make a reservation.', 'error');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        showToast('You do not have permission to make reservations. Please log in as a customer.', 'error');
      } else if (error.message.includes('409') || error.message.includes('already reserved')) {
        showToast('This table is already reserved at that time. Please select a different table or time.', 'error');
        // Refresh available tables
        checkAvailableTables();
      } else {
        showToast(error.message || 'Failed to create reservation. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <main style={{ padding: '0', margin: '0' }}>
      <Herosection
        title="Reserve a Table"
        subtitle="Book your table up to 30 minutes in advance for a seamless dining experience."
      >
        <Container fluid className="mt-5" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <Row className="justify-content-center g-4">
            <Col xl={5} lg={6} md={12} className="mb-4">
              <Card 
                className="shadow-sm"
                style={{
                  borderRadius: '16px',
                  border: `1px solid rgba(214, 127, 81, 0.2)`
                }}
              >
                <Card.Body className="p-4">
                  <h4 
                    className="card-title mb-4"
                    style={{ color: '#D67F51' }}
                  >
                    <i className="bi bi-calendar3 me-2"></i>Booking Information
                  </h4>
                  <Form onSubmit={handleSubmit}>
                    {/* Cart Return Notice */}
                    {returnToCart && (
                      <Alert 
                        variant="info" 
                        className="mb-4"
                        style={{
                          backgroundColor: 'rgba(214, 127, 81, 0.1)',
                          borderColor: '#D67F51',
                          color: '#D67F51',
                          borderRadius: '8px'
                        }}
                      >
                        <i className="bi bi-cart-check me-2"></i>
                        <strong>Complete Your Order:</strong> Book a table first, then you'll be redirected back to your cart to complete your order.
                      </Alert>
                    )}
                    
                    {/* Authentication Notice */}
                    {!isAuthenticated && (
                      <Alert 
                        variant="warning" 
                        className="mb-4"
                        style={{
                          backgroundColor: 'rgba(255, 193, 7, 0.1)',
                          borderColor: '#ffc107',
                          color: '#856404',
                          borderRadius: '8px'
                        }}
                      >
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Login Required:</strong> You need to log in as a customer to make a reservation.
                      </Alert>
                    )}
                    
                    {isAuthenticated && user && user.role !== 'customer' && (
                      <Alert 
                        variant="warning" 
                        className="mb-4"
                        style={{
                          backgroundColor: 'rgba(255, 193, 7, 0.1)',
                          borderColor: '#ffc107',
                          color: '#856404',
                          borderRadius: '8px'
                        }}
                      >
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <strong>Customer Account Required:</strong> Only customers can make table reservations.
                      </Alert>
                    )}

                    <Row className="gx-3">
                      <Col sm={6} className="mb-3">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder={isAuthenticated && user ? "Auto-filled from your account" : "Enter your name"}
                          required 
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          readOnly={isAuthenticated && user}
                          disabled={isAuthenticated && user}
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            padding: '10px 12px',
                            backgroundColor: (isAuthenticated && user) ? '#f8f9fa' : 'white',
                            cursor: (isAuthenticated && user) ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (!(isAuthenticated && user)) {
                              e.target.style.borderColor = '#D67F51';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
                            }
                          }}
                          onBlur={(e) => {
                            if (!(isAuthenticated && user)) {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }
                          }}
                        />
                        {isAuthenticated && user && (
                          <Form.Text className="text-muted">
                            <small><i className="bi bi-lock me-1"></i>Name auto-filled from your account</small>
                          </Form.Text>
                        )}
                      </Col>
                      <Col sm={6} className="mb-3">
                        <Form.Label>Phone Number *</Form.Label>
                        <Form.Control 
                          type="tel" 
                          placeholder={isAuthenticated && user ? "Auto-filled from your account" : "+254 700 000 000"}
                          required 
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          readOnly={isAuthenticated && user && (user.phone || user.phone_number)}
                          disabled={isAuthenticated && user && (user.phone || user.phone_number)}
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            padding: '10px 12px',
                            backgroundColor: (isAuthenticated && user && (user.phone || user.phone_number)) ? '#f8f9fa' : 'white',
                            cursor: (isAuthenticated && user && (user.phone || user.phone_number)) ? 'not-allowed' : 'text'
                          }}
                          onFocus={(e) => {
                            if (!(isAuthenticated && user && (user.phone || user.phone_number))) {
                              e.target.style.borderColor = '#D67F51';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
                            }
                          }}
                          onBlur={(e) => {
                            if (!(isAuthenticated && user && (user.phone || user.phone_number))) {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.boxShadow = 'none';
                            }
                          }}
                        />
                        {isAuthenticated && user && (user.phone || user.phone_number) && (
                          <Form.Text className="text-muted">
                            <small><i className="bi bi-lock me-1"></i>Phone auto-filled from your account</small>
                          </Form.Text>
                        )}
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder={isAuthenticated && user ? "Auto-filled from your account" : "your@email.com"}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        readOnly={isAuthenticated && user && user.email}
                        disabled={isAuthenticated && user && user.email}
                        style={{
                          borderRadius: '8px',
                          borderColor: '#e2e8f0',
                          padding: '10px 12px',
                          backgroundColor: (isAuthenticated && user && user.email) ? '#f8f9fa' : 'white',
                          cursor: (isAuthenticated && user && user.email) ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(isAuthenticated && user && user.email)) {
                            e.target.style.borderColor = '#D67F51';
                            e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!(isAuthenticated && user && user.email)) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                      {isAuthenticated && user && user.email && (
                        <Form.Text className="text-muted">
                          <small><i className="bi bi-lock me-1"></i>Email auto-filled from your account</small>
                        </Form.Text>
                      )}
                    </div>

                    <Row className="gx-3">
                      <Col sm={4} className="mb-3">
                        <Form.Label>Date *</Form.Label>
                        <Form.Control 
                          type="date" 
                          required 
                          min={today}
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            padding: '10px 12px'
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
                      </Col>
                      <Col sm={4} className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Select 
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            padding: '10px 12px'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#D67F51';
                            e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Browse all times</option>
                          {timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>
                              {slot.display}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          <small>Optional: Select a specific time or browse all available times</small>
                        </Form.Text>
                      </Col>
                      <Col sm={4} className="mb-3">
                        <Form.Label>Guests *</Form.Label>
                        <Form.Select
                          required
                          value={formData.guests}
                          onChange={(e) => handleInputChange('guests', e.target.value)}
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0',
                            padding: '10px 12px'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#D67F51';
                            e.target.style.boxShadow = '0 0 0 0.2rem rgba(214, 127, 81, 0.25)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Number</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>

                    <div className="mb-4">
                      <Form.Label>Special Requests</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Birthday celebration, wheelchair access, etc."
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        style={{
                          borderRadius: '8px',
                          borderColor: '#e2e8f0',
                          padding: '10px 12px'
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
                    </div>

                    <Button 
                      type="submit" 
                      disabled={!selectedTable || submitting || !isAuthenticated || (user && user.role !== 'customer')}
                      style={{
                        backgroundColor: '#D67F51',
                        borderColor: '#D67F51',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontWeight: '500',
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
                          <i className="spinner-border spinner-border-sm me-2"></i>
                          Reserving...
                        </>
                      ) : !isAuthenticated ? (
                        'Login Required'
                      ) : (user && user.role !== 'customer') ? (
                        'Customer Account Required'
                      ) : !selectedTable ? (
                        'Select a Table'
                      ) : (
                        'Reserve Table'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={7} lg={6} md={12} className="mb-4">
              <Card 
                className="shadow-sm h-100"
                style={{
                  borderRadius: '16px',
                  border: `1px solid rgba(214, 127, 81, 0.2)`
                }}
              >
                <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                  <h4 
                    className="card-title mb-4"
                    style={{ color: '#D67F51' }}
                  >
                    <i className="bi bi-people me-2"></i>Select Your Table
                  </h4>
                  
                  {!formData.date || !formData.guests ? (
                    <div className="text-center text-muted">
                      <i className="bi bi-info-circle fs-1 mb-3" style={{ color: '#D67F51' }}></i>
                      <p>Please select date and number of guests first to see available tables</p>
                    </div>
                  ) : checkingTables ? (
                    <div className="text-center">
                      <div className="spinner-border" style={{ color: '#D67F51' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Checking available tables...</p>
                    </div>
                  ) : availableTables.length === 0 ? (
                    <div className="text-center text-muted">
                      <i className="bi bi-exclamation-triangle fs-1 mb-3" style={{ color: '#D67F51' }}></i>
                      <p>No tables available for {formData.guests} guests{formData.time ? ` at ${formData.time}` : ' on this date'}.</p>
                      <p className="small">Try selecting a different time or date.</p>
                    </div>
                  ) : (
                    <div className="w-100">
                      <p className="text-center mb-4">
                        <strong>{availableTables.length}</strong> table{availableTables.length !== 1 ? 's' : ''} available for <strong>{formData.guests}</strong> guest{formData.guests !== '1' ? 's' : ''}
                        {formData.time && ` at ${formData.time}`}
                        {availableTables.length > 4 && (
                          <small className="d-block text-muted mt-1">
                            <i className="bi bi-arrow-down-up me-1"></i>
                            Scroll to see all tables
                          </small>
                        )}
                      </p>
                      <div 
                        className="overflow-auto custom-scrollbar"
                        style={{
                          maxHeight: availableTables.length > 4 ? '400px' : 'auto',
                          paddingRight: availableTables.length > 4 ? '8px' : '0'
                        }}
                      >
                        <Row className="g-3">
                          {availableTables.map(table => (
                          <Col lg={6} md={6} sm={6} xs={12} key={table.id}>
                            <Card 
                              className={`text-center cursor-pointer ${selectedTable?.id === table.id ? 'border-2' : ''}`}
                              style={{
                                borderRadius: '12px',
                                borderColor: selectedTable?.id === table.id ? '#D67F51' : '#e2e8f0',
                                backgroundColor: selectedTable?.id === table.id ? 'rgba(214, 127, 81, 0.1)' : 'white',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                              }}
                              onClick={() => setSelectedTable(table)}
                              onMouseEnter={(e) => {
                                if (selectedTable?.id !== table.id) {
                                  e.currentTarget.style.borderColor = '#D67F51';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(214, 127, 81, 0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedTable?.id !== table.id) {
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              <Card.Body className="py-3">
                                <div 
                                  className="mb-2"
                                  style={{ 
                                    fontSize: '1.8rem',
                                    color: selectedTable?.id === table.id ? '#D67F51' : '#6b7280'
                                  }}
                                >
                                  <i className="bi bi-table"></i>
                                </div>
                                <h6 
                                  className="mb-1"
                                  style={{ 
                                    color: selectedTable?.id === table.id ? '#D67F51' : '#374151',
                                    fontWeight: '600'
                                  }}
                                >
                                  Table {table.table_number}
                                </h6>
                                <small 
                                  className="text-muted d-block mb-2"
                                  style={{ 
                                    color: selectedTable?.id === table.id ? '#c56742' : '#6b7280'
                                  }}
                                >
                                  Seats {table.capacity}
                                </small>
                                
                                {/* Show available time slots if no specific time is selected */}
                                {!formData.time && table.available_time_slots && (
                                  <div className="mt-2">
                                    <small className="text-muted d-block mb-1">Available times:</small>
                                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                                      {table.available_time_slots.slice(0, 4).map(slot => (
                                        <span 
                                          key={slot}
                                          className="badge"
                                          style={{
                                            backgroundColor: 'rgba(214, 127, 81, 0.1)',
                                            color: '#D67F51',
                                            fontSize: '0.7rem'
                                          }}
                                        >
                                          {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                          })}
                                        </span>
                                      ))}
                                      {table.available_time_slots.length > 4 && (
                                        <span 
                                          className="badge"
                                          style={{
                                            backgroundColor: 'rgba(214, 127, 81, 0.1)',
                                            color: '#D67F51',
                                            fontSize: '0.7rem'
                                          }}
                                        >
                                          +{table.available_time_slots.length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedTable?.id === table.id && (
                                  <div className="mt-2">
                                    <i className="bi bi-check-circle-fill" style={{ color: '#D67F51' }}></i>
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                        </Row>
                      </div>
                      {selectedTable && (
                        <Alert 
                          variant="success" 
                          className="mt-3 text-center"
                          style={{
                            backgroundColor: 'rgba(214, 127, 81, 0.1)',
                            borderColor: '#D67F51',
                            color: '#D67F51',
                            borderRadius: '8px'
                          }}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Table {selectedTable.table_number} selected (seats {selectedTable.capacity})
                          {!formData.time && selectedTable.available_time_slots && (
                            <div className="mt-2">
                              <small>Available at {selectedTable.available_time_slots.length} time slots today</small>
                            </div>
                          )}
                        </Alert>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Custom Toast Container */}
        <ToastContainer />
      </Herosection>
    </main>
  );
}
