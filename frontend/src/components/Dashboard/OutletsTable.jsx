import React, { useState, useEffect } from 'react';
import { Store, Edit3, Trash2, Plus, AlertTriangle } from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", confirmVariant = "danger", loading = false }) => {
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
                  Deleting...
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

const AddOutletModal = ({ isOpen, onClose, onSubmit, editingOutlet = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: editingOutlet?.name || '',
    cuisine_type: editingOutlet?.cuisine_type || '',
    location: editingOutlet?.location || ''
  });

  const cuisineTypes = [
    'Kenyan', 'Nigerian', 'Congolese', 'Ethiopian', 'African',
    'Italian', 'Chinese', 'Indian', 'Mexican', 
    'Japanese', 'American', 'Mediterranean', 'Thai', 'French', 'Mixed'
  ];

  // Update form data when editingOutlet changes
  useEffect(() => {
    if (editingOutlet) {
      setFormData({
        name: editingOutlet.name || '',
        cuisine_type: editingOutlet.cuisine_type || '',
        location: editingOutlet.location || ''
      });
    } else {
      setFormData({ name: '', cuisine_type: '', location: '' });
    }
  }, [editingOutlet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {editingOutlet ? 'Edit Outlet' : 'Add New Outlet'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body pt-2">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium">Outlet Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter outlet name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Cuisine Type</label>
                <select
                  className="form-select"
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select cuisine type</option>
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Location</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Ground Floor - Section A"
                  required
                  disabled={loading}
                />
              </div>

              <div className="d-flex gap-3">
                <button 
                  type="button" 
                  className="btn btn-secondary flex-fill" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-fill d-flex align-items-center justify-content-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      {editingOutlet ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingOutlet ? 'Update Outlet' : 'Add Outlet'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export function OutletsTable() {
  const [outlets, setOutlets] = useState([]);
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, checkAuthStatus } = useAuth();
  const { showToast, ToastContainer } = useToast();

  // Load outlets on component mount
  useEffect(() => {
    loadOutlets();
  }, []);

  const loadOutlets = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user's restaurants (outlets)
      if (user && user.restaurants) {
        setOutlets(user.restaurants);
      } else {
        // Fallback: fetch from API if not in user data
        const response = await apiService.getRestaurants();
        setOutlets(response.data || []);
      }
    } catch (error) {
      console.error('Error loading outlets:', error);
      setError('Failed to load outlets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet);
    setShowAddOutletModal(true);
  };

  const handleDelete = (outlet) => {
    setOutletToDelete(outlet);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!outletToDelete) return;

    try {
      setDeleteLoading(true);
      await apiService.deleteRestaurant(outletToDelete.id);
      
      // Remove from local state
      setOutlets(outlets.filter(o => o.id !== outletToDelete.id));
      
      // Refresh user data to sync restaurants
      await checkAuthStatus();
      
      // Show success toast
      showToast(`Outlet "${outletToDelete.name}" has been deleted successfully.`, 'success');
      
    } catch (error) {
      console.error('Error deleting outlet:', error);
      showToast('Failed to delete outlet. Please try again.', 'error');
    } finally {
      setDeleteLoading(false);
      setShowConfirmDelete(false);
      setOutletToDelete(null);
    }
  };

  const handleOutletSubmit = async (outletData) => {
    try {
      setActionLoading(true);
      
      if (editingOutlet) {
        // Update existing outlet
        const response = await apiService.updateRestaurant(editingOutlet.id, outletData);
        
        // Update local state
        setOutlets(outlets.map(outlet => 
          outlet.id === editingOutlet.id ? response.data : outlet
        ));
        
        // Refresh user data to sync restaurants
        await checkAuthStatus();
        
        showToast(`Outlet "${outletData.name}" has been updated successfully.`, 'success');
      } else {
        // Add new outlet
        const response = await apiService.createRestaurant(outletData);
        
        // Add to local state
        setOutlets([...outlets, response.data]);
        
        // Refresh user data to sync restaurants
        await checkAuthStatus();
        
        showToast(`Outlet "${outletData.name}" has been added successfully.`, 'success');
      }
      
      // Close modal and reset state
      setShowAddOutletModal(false);
      setEditingOutlet(null);
      
    } catch (error) {
      console.error('Error saving outlet:', error);
      showToast(`Failed to ${editingOutlet ? 'update' : 'add'} outlet. Please try again.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-4 shadow-sm">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading outlets...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 rounded-3 bg-primary bg-opacity-10">
            <Store size={24} className="text-primary" />
          </div>
          <div>
            <h5 className="mb-1 fw-bold">Outlet Management</h5>
            <p className="text-muted mb-0">Manage your restaurant outlets</p>
          </div>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setEditingOutlet(null);
            setShowAddOutletModal(true);
          }}
          disabled={actionLoading}
        >
          <Plus size={18} />
          Add Outlet
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            className="btn btn-link p-0 ms-2" 
            onClick={loadOutlets}
            style={{ textDecoration: 'none' }}
          >
            Try again
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead style={{ backgroundColor: "#FFFBF7" }}>
            <tr>
              <th className="fw-semibold">Outlet Name</th>
              <th className="fw-semibold">Cuisine Type</th>
              <th className="fw-semibold">Location</th>
              <th className="fw-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {outlets.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  <Store size={48} className="mb-3 opacity-50" />
                  <div>No outlets found. Add your first outlet to get started.</div>
                </td>
              </tr>
            ) : (
              outlets.map((outlet) => (
                <tr key={outlet.id}>
                  <td>
                    <div className="fw-semibold">{outlet.name}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">{outlet.cuisine_type}</span>
                  </td>
                  <td>
                    <div className="text-muted">{outlet.location}</div>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(outlet)}
                        title="Edit outlet"
                        disabled={actionLoading}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(outlet)}
                        title="Delete outlet"
                        disabled={actionLoading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddOutletModal
        isOpen={showAddOutletModal}
        onClose={() => {
          setShowAddOutletModal(false);
          setEditingOutlet(null);
        }}
        onSubmit={handleOutletSubmit}
        editingOutlet={editingOutlet}
        loading={actionLoading}
      />

      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setOutletToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Outlet"
        message={`Are you sure you want to delete "${outletToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Outlet"
        confirmVariant="danger"
        loading={deleteLoading}
      />

      <ToastContainer />
    </div>
  );
}
