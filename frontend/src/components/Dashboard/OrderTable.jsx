import React, { useState, useEffect } from "react";
import { OrderRow } from "./OrderRow";
import { AlertTriangle } from "lucide-react";
import apiService from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../Toast";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", confirmVariant = "primary", loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-2">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-2 rounded-circle ${confirmVariant === 'danger' ? 'bg-danger bg-opacity-10' : 'bg-primary bg-opacity-10'}`}>
                <AlertTriangle size={20} className={confirmVariant === 'danger' ? 'text-danger' : 'text-primary'} />
              </div>
              <h5 className="modal-title fw-bold mb-0">{title}</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
          </div>

          <div className="modal-body pt-0 pb-2">
            <p className="text-muted mb-0">{message}</p>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className={`btn btn-${confirmVariant} d-flex align-items-center`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrdersTable = ({ filter = 'today' }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadOrders();
    }
  }, [user, filter]); // Add filter as dependency

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      if (!user || user.role !== 'owner') {
        showToast('Only restaurant owners can view orders.', 'error');
        return;
      }

      console.log('Current user:', user);
      console.log('About to call getOrders API...');
      
      const response = await apiService.getOrders();
      console.log('Orders API response:', response); // Debug log
      
      // Handle nested data structure like in Orders.jsx
      let orderData = response.data || response;
      if (orderData.data && Array.isArray(orderData.data)) {
        orderData = orderData.data;
      }
      
      console.log('Order data:', orderData); // Debug log
      console.log('Sample order:', orderData[0]); // Debug first order
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showToast('Your session has expired. Please log in again.', 'error');
        // You might want to redirect to login page here
      } else {
        showToast('Failed to load orders. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Show confirmation for reject action
    if (newStatus.toLowerCase() === 'rejected') {
      setConfirmAction({
        type: 'reject',
        orderId,
        newStatus,
        title: 'Reject Order',
        message: 'Are you sure you want to reject this order? This action cannot be undone.',
        confirmText: 'Reject Order',
        confirmVariant: 'danger'
      });
      setShowConfirmModal(true);
      return;
    }

    // For other status changes, update directly
    await updateOrderStatus(orderId, newStatus);
  };

  const handleAcceptOrder = (orderId) => {
    updateOrderStatus(orderId, 'accepted');
  };

  const handleRejectOrder = (orderId) => {
    setConfirmAction({
      type: 'reject',
      orderId,
      newStatus: 'rejected',
      title: 'Reject Order',
      message: 'Are you sure you want to reject this order? This action cannot be undone.',
      confirmText: 'Reject Order',
      confirmVariant: 'danger'
    });
    setShowConfirmModal(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }
          : order
      ));
      
      showToast(`Order status updated to ${newStatus}.`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Failed to update order status. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (confirmAction) {
      await updateOrderStatus(confirmAction.orderId, confirmAction.newStatus);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  // Filter orders based on the filter prop
  const getFilteredOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      // Try to get order date from multiple possible fields, prioritizing order_time
      let orderDate = null;
      
      if (order.order_time) {
        orderDate = new Date(order.order_time);
      } else if (order.order_date) {
        orderDate = new Date(order.order_date);
      } else if (order.created_at) {
        orderDate = new Date(order.created_at);
      }
      
      // If we have a valid date, normalize it for comparison
      if (orderDate && !isNaN(orderDate.getTime())) {
        orderDate.setHours(0, 0, 0, 0);
      }
      
      switch (filter) {
        case 'today':
          return orderDate && orderDate.getTime() === today.getTime();
        case 'pending':
          const status = (order.status || order.order_status || '').toLowerCase();
          return ['pending', 'received', 'accepted'].includes(status);
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="card p-4 shadow-sm">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Check if user is not an owner
  if (!user || user.role !== 'owner') {
    return (
      <div className="card p-4 shadow-sm">
        <div className="text-center py-5">
          <AlertTriangle size={48} className="text-warning mb-3" />
          <h6 className="text-muted">Access Restricted</h6>
          <p className="text-muted small">Only restaurant owners can view orders.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-0 fw-bold">
            {filter === 'today' ? "Today's Orders" : 
             filter === 'pending' ? "Pending Orders" : 
             "All Orders"}
          </h5>
          <small className="text-muted">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </small>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {filteredOrders.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ backgroundColor: "#FFFBF7" }}>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <OrderRow 
                  key={order.id} 
                  {...order} 
                  onAccept={() => handleAcceptOrder(order.id)}
                  onReject={() => handleRejectOrder(order.id)}
                  onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-5">
          <AlertTriangle size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No Orders Found</h6>
          <p className="text-muted small">
            {filter === 'today' ? 'No orders have been placed today.' : 
             filter === 'pending' ? 'No pending orders at the moment.' :
             'No orders have been placed for your restaurants yet.'}
          </p>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={confirmStatusChange}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText={confirmAction?.confirmText}
        confirmVariant={confirmAction?.confirmVariant}
        loading={actionLoading}
      />

      <ToastContainer />
    </div>
  );
};
