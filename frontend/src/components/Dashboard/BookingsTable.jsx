import React, { useState, useEffect } from "react";
import { Check, X, Phone, Mail, Calendar, Users, AlertTriangle } from "lucide-react";
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", confirmVariant = "primary", loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-2">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-2 rounded-circle ${confirmVariant === 'danger' ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10'}`}>
                <AlertTriangle size={20} className={confirmVariant === 'danger' ? 'text-danger' : 'text-warning'} />
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

export const BookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReservations();
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast('Failed to load bookings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking, status) => {
    if (status === 'rejected') {
      // Show confirmation dialog for rejection
      setBookingToUpdate(booking);
      setNewStatus(status);
      setShowConfirmModal(true);
    } else {
      // Directly update for confirmation
      await updateBookingStatus(booking, status);
    }
  };

  const updateBookingStatus = async (booking, status) => {
    try {
      setActionLoading(true);
      await apiService.updateReservationStatus(booking.id, status);
      
      // Update local state
      setBookings(bookings.map(b => 
        b.id === booking.id 
          ? { ...b, status: status }
          : b
      ));
      
      const statusText = status === 'confirmed' ? 'confirmed' : 'rejected';
      showToast(`Booking for ${booking.customer?.username || 'customer'} has been ${statusText}.`, 'success');
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      showToast('Failed to update booking status. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusUpdate = async () => {
    if (bookingToUpdate && newStatus) {
      await updateBookingStatus(bookingToUpdate, newStatus);
      setShowConfirmModal(false);
      setBookingToUpdate(null);
      setNewStatus('');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning text-dark";
      case "confirmed":
        return "bg-success text-white";
      case "rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="card p-4 shadow-sm">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading bookings...</p>
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
          <p className="text-muted small">Only restaurant owners can manage bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm">
      <h5 className="mb-3">Table Bookings</h5>
      
      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <Calendar size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No Bookings Found</h6>
          <p className="text-muted small">No table reservations have been made yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ backgroundColor: "#FFFBF7" }}>
              <tr>
                <th>Customer Details</th>
                <th>Date & Time</th>
                <th>Party Size</th>
                <th>Table</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="fw-semibold">{booking.customer?.username || 'Unknown Customer'}</div>
                    <div className="text-muted small d-flex align-items-center gap-1">
                      <Phone size={12} />
                      {booking.customer?.phone || 'N/A'}
                    </div>
                    <div className="text-muted small d-flex align-items-center gap-1">
                      <Mail size={12} />
                      {booking.customer?.email || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1 fw-medium">
                      <Calendar size={14} />
                      {formatDate(booking.reservation_time)}
                    </div>
                    <div className="text-muted small">{formatTime(booking.reservation_time)}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <Users size={14} />
                      <span className="fw-medium">{booking.members_count}</span> people
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {booking.table?.number ? `Table ${booking.table.number}` : 'Table TBD'}
                    </span>
                  </td>
                  <td>
                    <span className="text-muted small">{booking.duration} minutes</span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {booking.status === "pending" ? (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-success d-flex align-items-center gap-1"
                          onClick={() => handleStatusChange(booking, 'confirmed')}
                          disabled={actionLoading}
                          title="Confirm Booking"
                        >
                          <Check size={14} />
                          Confirm
                        </button>
                        <button 
                          className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                          onClick={() => handleStatusChange(booking, 'rejected')}
                          disabled={actionLoading}
                          title="Reject Booking"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    ) : booking.status === "confirmed" ? (
                      <div className="d-flex gap-1">
                        <span className="text-success small fw-medium">✓ Confirmed</span>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleStatusChange(booking, 'rejected')}
                          disabled={actionLoading}
                          title="Reject Booking"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : booking.status === "rejected" ? (
                      <div className="d-flex gap-1">
                        <span className="text-danger small">✗ Rejected</span>
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleStatusChange(booking, 'confirmed')}
                          disabled={actionLoading}
                          title="Confirm Booking"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted small">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setBookingToUpdate(null);
          setNewStatus('');
        }}
        onConfirm={confirmStatusUpdate}
        title="Reject Booking"
        message={`Are you sure you want to reject the booking for ${bookingToUpdate?.customer?.username || 'this customer'}? This action will notify the customer.`}
        confirmText="Reject Booking"
        confirmVariant="danger"
        loading={actionLoading}
      />

      <ToastContainer />
    </div>
  );
};
