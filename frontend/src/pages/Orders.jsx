import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Truck, MapPin, Phone, Calendar, Users, Table } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import apiService from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [reservationFilter, setReservationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomerOrders();
      console.log('Orders API response:', response); // Debug log
      
      // Handle nested data structure: response.data.data
      let orderData = response.data || response;
      if (orderData.data && Array.isArray(orderData.data)) {
        orderData = orderData.data;
      }
      
      console.log('Order data:', orderData); // Debug log
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders. Please try again.', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await apiService.getCustomerReservations();
      console.log('Reservations API response:', response); 
      
      // Handle nested data structure
      let reservationData = response.data || response;
      if (reservationData.data && Array.isArray(reservationData.data)) {
        reservationData = reservationData.data;
      }
      
      console.log('Processed reservation data:', reservationData); 
      setReservations(Array.isArray(reservationData) ? reservationData : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showToast('Failed to load reservations. Please try again.', 'error');
      setReservations([]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing':
      case 'received':
      case 'accepted':
        return <Clock className="text-warning" size={20} />;
      case 'ready':
      case 'on_way':
        return <Truck className="text-info" size={20} />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="text-success" size={20} />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="text-danger" size={20} />;
      default:
        return <Clock className="text-secondary" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'preparing':
        return 'Preparing';
      case 'received':
        return 'Order Received';
      case 'accepted':
        return 'Accepted';
      case 'ready':
        return 'Ready';
      case 'on_way':
        return 'On the way';
      case 'Served':
        return 'Delivered';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'preparing':
      case 'received':
      case 'accepted':
        return 'badge bg-warning text-dark';
      case 'ready':
      case 'on_way':
        return 'badge bg-info text-white';
      case 'delivered':
      case 'completed':
        return 'badge bg-success text-white';
      case 'cancelled':
      case 'rejected':
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  };

  const getReservationStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'free':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  const getReservationStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-warning" size={20} />;
      case 'confirmed':
        return <CheckCircle className="text-success" size={20} />;
      case 'free':
        return <CheckCircle className="text-info" size={20} />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="text-danger" size={20} />;
      default:
        return <Clock className="text-secondary" size={20} />;
    }
  };

  const getReservationStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'confirmed':
        return 'badge bg-success text-white';
      case 'free':
        return 'badge bg-info text-white';
      case 'cancelled':
      case 'rejected':
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  };

  const filteredOrders = orders.filter(order => {
    const status = order.status || order.order_status; // Handle both status field names
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending') return ['preparing', 'received', 'accepted', 'ready', 'pending'].includes(status);
    if (orderFilter === 'completed') return ['delivered', 'completed'].includes(status);
    if (orderFilter === 'cancelled') return ['cancelled', 'rejected'].includes(status);
    return true;
  });

  const filteredReservations = reservations.filter(reservation => {
    if (reservationFilter === 'all') return true;
    if (reservationFilter === 'pending') return reservation.status === 'pending';
    if (reservationFilter === 'confirmed') return reservation.status === 'confirmed';
    if (reservationFilter === 'completed') return reservation.status === 'free';
    if (reservationFilter === 'cancelled') return ['cancelled', 'rejected'].includes(reservation.status);
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <h4 className="text-muted">Login Required</h4>
          <p className="text-muted">Please log in to view your orders and reservations.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">My Orders & Reservations</h2>
              <p className="text-muted mb-0">Track your food orders and table reservations</p>
            </div>
          </div>

          {/* Main Tabs - Orders vs Reservations */}
          <div className="d-flex mb-4 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', maxWidth: '300px' }}>
            {[
              { key: 'orders', label: 'Orders', count: orders.length },
              { key: 'reservations', label: 'Reservations', count: reservations.length }
            ].map(tab => (
              <button
                key={tab.key}
                className={`flex-fill btn ${activeTab === tab.key ? 'btn-primary' : 'btn-light'}`}
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  padding: '8px 12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              {/* Orders Filter Tabs */}
              <div className="d-flex mb-4 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', maxWidth: '600px' }}>
                {[
                  { key: 'all', label: 'All Orders', count: orders.length },
                  { key: 'pending', label: 'In Progress', count: orders.filter(o => ['preparing', 'received', 'accepted', 'ready', 'pending'].includes(o.status || o.order_status)).length },
                  { key: 'completed', label: 'Completed', count: orders.filter(o => ['delivered', 'completed'].includes(o.status || o.order_status)).length },
                  { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => ['cancelled', 'rejected'].includes(o.status || o.order_status)).length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`flex-fill btn ${orderFilter === tab.key ? 'btn-primary' : 'btn-light'}`}
                    style={{
                      borderRadius: '8px',
                      border: 'none',
                      padding: '8px 12px',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setOrderFilter(tab.key)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <Calendar size={64} className="text-muted" />
                  </div>
                  <h4 className="text-muted">No orders found</h4>
                  <p className="text-muted">You haven't placed any orders yet. Start exploring our delicious menu!</p>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredOrders.map(order => (
                    <div key={order.order_id || order.id} className="col-12">
                      <div 
                        className="card border-0 shadow-sm"
                        style={{ 
                          borderRadius: '16px',
                          overflow: 'hidden',
                          transition: 'transform 0.2s, box-shadow 0.2s'
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
                        <div className="card-body p-4">
                          <div className="row align-items-center">
                            <div className="col-lg-8">
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-3">
                                  <h5 className="card-title mb-0 fw-bold">{order.restaurant_name || 'Unknown Restaurant'}</h5>
                                  <span className={getStatusBadgeClass(order.status || order.order_status)}>
                                    {getStatusText(order.status || order.order_status)}
                                  </span>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-primary" style={{ fontSize: '18px' }}>
                                    KES {(order.total || 0).toLocaleString()}
                                  </div>
                                  <small className="text-muted">Order {order.id || order.order_id}</small>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="mb-3">
                                <div className="row g-2">
                                  {(order.items || []).map((item, index) => (
                                    <div key={index} className="col-md-6">
                                      <div 
                                        className="d-flex justify-content-between align-items-center p-2 rounded"
                                        style={{ backgroundColor: '#f8f9fa' }}
                                      >
                                        <span className="fw-medium">{item.name}</span>
                                        <span className="text-muted">x{item.quantity}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Details */}
                              <div className="row g-3 text-muted small">
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(order.order_date)}</span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center gap-2">
                                    <Table size={16} />
                                    <span>Table {order.table_number || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-4">
                              <div className="text-center">
                                <div className="mb-3">
                                  {getStatusIcon(order.status || order.order_status)}
                                </div>
                                <div className="fw-bold mb-1">{getStatusText(order.status || order.order_status)}</div>
                                {order.estimated_serving_time && ['preparing', 'received', 'accepted'].includes(order.status || order.order_status) && (
                                  <div className="text-muted small">
                                    ETA: {order.estimated_serving_time}
                                  </div>
                                )}
                                {['delivered', 'completed'].includes(order.status || order.order_status) && (
                                  <button 
                                    className="btn btn-outline-primary btn-sm mt-2"
                                    style={{ borderRadius: '8px' }}
                                  >
                                    Reorder
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <>
              {/* Reservations Filter Tabs */}
              <div className="d-flex mb-4 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', maxWidth: '500px' }}>
                {[
                  { key: 'all', label: 'All Reservations', count: reservations.length },
                  { key: 'pending', label: 'Pending', count: reservations.filter(r => r.status === 'pending').length },
                  { key: 'confirmed', label: 'Confirmed', count: reservations.filter(r => r.status === 'confirmed').length },
                  { key: 'completed', label: 'Completed', count: reservations.filter(r => r.status === 'free').length },
                  { key: 'cancelled', label: 'Cancelled', count: reservations.filter(r => ['cancelled', 'rejected'].includes(r.status)).length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`flex-fill btn ${reservationFilter === tab.key ? 'btn-primary' : 'btn-light'}`}
                    style={{
                      borderRadius: '8px',
                      border: 'none',
                      padding: '8px 12px',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setReservationFilter(tab.key)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Reservations List */}
              {filteredReservations.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <Calendar size={64} className="text-muted" />
                  </div>
                  <h4 className="text-muted">No reservations found</h4>
                  <p className="text-muted">You haven't made any table reservations yet. Book a table to dine with us!</p>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredReservations.map(reservation => (
                    <div key={reservation.id} className="col-md-6">
                      <div 
                        className="card border-0 shadow-sm"
                        style={{ 
                          borderRadius: '16px',
                          overflow: 'hidden',
                          transition: 'transform 0.2s, box-shadow 0.2s'
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
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="card-title mb-0 fw-bold">Table {reservation.table_number}</h5>
                            <span className={getReservationStatusBadgeClass(reservation.status)}>
                              {getReservationStatusText(reservation.status)}
                            </span>
                          </div>

                          <div className="row g-3 text-muted small">
                            <div className="col-12">
                              <div className="d-flex align-items-center gap-2">
                                <Calendar size={16} />
                                <span className="fw-medium">
                                  {formatDate(reservation.reservation_time)}
                                </span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="d-flex align-items-center gap-2">
                                <Users size={16} />
                                <span>{reservation.members_count} guests</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="d-flex align-items-center gap-2">
                                <Clock size={16} />
                                <span>{reservation.duration} mins</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="d-flex align-items-center gap-2">
                                <Table size={16} />
                                <span>Seats {reservation.table_capacity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-center mt-3">
                            <div className="mb-2">
                              {getReservationStatusIcon(reservation.status)}
                            </div>
                            {reservation.status === 'pending' && (
                              <small className="text-muted">Awaiting confirmation</small>
                            )}
                            {reservation.status === 'confirmed' && (
                              <small className="text-success">Ready to dine!</small>
                            )}
                            {reservation.status === 'free' && (
                              <small className="text-info">Order completed</small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
