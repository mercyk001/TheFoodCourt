import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Truck, MapPin, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('http://localhost:8000/orders');
      const allOrders = await response.json();
      
      // Filter orders for current user
      const userOrders = allOrders.filter(order => order.customerId === user?.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to sample data if API fails
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  // Sample orders data for demonstration
  const sampleOrders = [
    {
      id: 'ORD-001',
      customerId: user?.id || 1,
      restaurantName: 'Mama Africa Kitchen',
      items: [
        { name: 'Nyama Choma', quantity: 2, price: 800 },
        { name: 'Ugali & Sukuma', quantity: 1, price: 250 }
      ],
      total: 1850,
      status: 'delivered',
      orderDate: '2024-01-15T10:30:00Z',
      deliveryAddress: '123 Main St, Nairobi',
      phone: '+254712345678',
      estimatedDelivery: '45 mins'
    },
    {
      id: 'ORD-002',
      customerId: user?.id || 1,
      restaurantName: 'Lagos Bites',
      items: [
        { name: 'Jollof Rice', quantity: 1, price: 600 },
        { name: 'Puff Puff', quantity: 3, price: 150 }
      ],
      total: 1050,
      status: 'preparing',
      orderDate: '2024-01-20T14:15:00Z',
      deliveryAddress: '456 Oak Ave, Nairobi',
      phone: '+254712345678',
      estimatedDelivery: '25 mins'
    },
    {
      id: 'ORD-003',
      customerId: user?.id || 1,
      restaurantName: 'Congo Delights',
      items: [
        { name: 'Pondu', quantity: 1, price: 550 },
        { name: 'Makayabu', quantity: 1, price: 750 }
      ],
      total: 1300,
      status: 'on_way',
      orderDate: '2024-01-22T16:45:00Z',
      deliveryAddress: '789 Pine St, Nairobi',
      phone: '+254712345678',
      estimatedDelivery: '10 mins'
    },
    {
      id: 'ORD-004',
      customerId: user?.id || 1,
      restaurantName: 'Addis Taste',
      items: [
        { name: 'Injera', quantity: 2, price: 500 },
        { name: 'Tibs', quantity: 1, price: 750 }
      ],
      total: 1750,
      status: 'cancelled',
      orderDate: '2024-01-18T12:20:00Z',
      deliveryAddress: '321 Elm St, Nairobi',
      phone: '+254712345678'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing':
        return <Clock className="text-warning" size={20} />;
      case 'on_way':
        return <Truck className="text-info" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-success" size={20} />;
      case 'cancelled':
        return <XCircle className="text-danger" size={20} />;
      default:
        return <Clock className="text-secondary" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'preparing':
        return 'Preparing';
      case 'on_way':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'preparing':
        return 'badge bg-warning text-dark';
      case 'on_way':
        return 'badge bg-info text-white';
      case 'delivered':
        return 'badge bg-success text-white';
      case 'cancelled':
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['preparing', 'on_way'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <h2 className="fw-bold mb-1">My Orders</h2>
              <p className="text-muted mb-0">Track and manage your food orders</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="d-flex mb-4 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', maxWidth: '500px' }}>
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'pending', label: 'Pending', count: orders.filter(o => ['preparing', 'on_way'].includes(o.status)).length },
              { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length },
              { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
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
                <div key={order.id} className="col-12">
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
                              <h5 className="card-title mb-0 fw-bold">{order.restaurantName}</h5>
                              <span className={getStatusBadgeClass(order.status)}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold text-primary" style={{ fontSize: '18px' }}>
                                Ksh {order.total.toLocaleString()}
                              </div>
                              <small className="text-muted">Order #{order.id}</small>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-3">
                            <div className="row g-2">
                              {order.items.map((item, index) => (
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
                            <div className="col-md-4">
                              <div className="d-flex align-items-center gap-2">
                                <Calendar size={16} />
                                <span>{formatDate(order.orderDate)}</span>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="d-flex align-items-center gap-2">
                                <MapPin size={16} />
                                <span className="text-truncate">{order.deliveryAddress}</span>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="d-flex align-items-center gap-2">
                                <Phone size={16} />
                                <span>{order.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-4">
                          <div className="text-center">
                            <div className="mb-3">
                              {getStatusIcon(order.status)}
                            </div>
                            <div className="fw-bold mb-1">{getStatusText(order.status)}</div>
                            {order.estimatedDelivery && ['preparing', 'on_way'].includes(order.status) && (
                              <div className="text-muted small">
                                ETA: {order.estimatedDelivery}
                              </div>
                            )}
                            {order.status === 'delivered' && (
                              <button 
                                className="btn btn-outline-primary btn-sm mt-2"
                                style={{ borderRadius: '8px' }}
                              >
                                Reorder
                              </button>
                            )}
                            {['preparing', 'on_way'].includes(order.status) && (
                              <button 
                                className="btn btn-outline-danger btn-sm mt-2"
                                style={{ borderRadius: '8px' }}
                              >
                                Cancel Order
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
        </div>
      </div>
    </div>
  );
}
