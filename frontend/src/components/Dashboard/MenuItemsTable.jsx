import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, Plus, Tag, Store, Filter, AlertTriangle, Image } from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';

// Image Selector Component
const ImageSelector = ({ isOpen, onClose, onSelect, searchQuery }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && searchQuery) {
      console.log('ImageSelector opened with query:', searchQuery);
      searchImages();
    }
  }, [isOpen, searchQuery]);

  const searchImages = async () => {
    console.log('Starting image search for:', searchQuery);
    setLoading(true);
    setError('');
    try {
      const response = await apiService.searchFoodImages(searchQuery);
      console.log('Images response:', response);
      setImages(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        setError('No images found for this item.');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    console.log('Image selected:', imageUrl);
    onSelect(imageUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Select Image for "{searchQuery}"</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Searching for images...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <div className="text-danger mb-3">
                  <AlertTriangle size={48} />
                </div>
                <p className="text-muted">{error}</p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={searchImages}
                >
                  Try Again
                </button>
              </div>
            ) : images.length > 0 ? (
              <div className="row g-3">
                {images.map((image) => (
                  <div key={image.id} className="col-md-4">
                    <div 
                      className="card border-0 shadow-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <img 
                        src={image.url} 
                        className="card-img-top" 
                        alt={image.description}
                        style={{ height: '150px', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('Image failed to load:', image.url);
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="card-body p-2">
                        <small className="text-muted">{image.description}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No images available for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const AddMenuItemModal = ({ isOpen, onClose, selectedOutletId, onSubmit, editingItem = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    price: editingItem?.price || '',
    category: editingItem?.category || '',
    image_url: editingItem?.image_url || ''
  });
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log('showImageSelector changed:', showImageSelector);
  }, [showImageSelector]);

  // Update form data when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        description: editingItem.description || '',
        price: editingItem.price || '',
        category: editingItem.category || '',
        image_url: editingItem.image_url || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: ''
      });
    }
  }, [editingItem, isOpen]);

  const categories = [
    'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 
    'Salad', 'Soup', 'Snack', 'Breakfast', 'Lunch', 'Dinner'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
    setShowImageSelector(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      restaurant_id: selectedOutletId,
      meal_id: 1 // You may need to adjust this based on your meal system
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '700px' }}>
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
            </div>

            <div className="modal-body pt-2">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Item Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter menu item name"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-medium">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Price (KES)</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      KES
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter item description and ingredients"
                    rows={3}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium">Image</label>
                  <div className="d-flex gap-2 align-items-start">
                    <input
                      type="url"
                      className="form-control"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="Enter image URL or click to browse"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        console.log('Browse images button clicked');
                        console.log('formData.name:', formData.name);
                        console.log('loading:', loading);
                        setShowImageSelector(true);
                      }}
                      disabled={loading || !formData.name}
                      title={!formData.name ? "Enter item name first" : "Browse food images"}
                    >
                      <Image size={16} />
                    </button>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="img-thumbnail"
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
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
                        {editingItem ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingItem ? 'Update Menu Item' : 'Add Menu Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ImageSelector
        isOpen={showImageSelector}
        onClose={() => {
          console.log('Closing ImageSelector');
          setShowImageSelector(false);
        }}
        onSelect={handleImageSelect}
        searchQuery={formData.name}
      />
      {/* Debug info */}
      {showImageSelector && console.log('ImageSelector should be visible with query:', formData.name)}
    </>
  );
};

export const MenuItemsTable = () => {
  const [outlets, setOutlets] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, checkAuthStatus } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const categories = ['all', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Salad', 'Soup', 'Snack'];

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user && user.role === 'owner') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Only allow owners to access this component
      if (!user || user.role !== 'owner') {
        showToast('Only restaurant owners can manage menu items.', 'error');
        return;
      }
      
      // Load user's restaurants (outlets)
      const outletsResponse = await apiService.getUserRestaurants();
      setOutlets(outletsResponse.data);
      
      // Load menu items from owner's outlets
      await loadMenuItems();
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      if (selectedOutletId === 'all') {
        // Load menu items from all owner's outlets
        const allMenuItems = [];
        for (const outlet of outlets) {
          const response = await apiService.getMenusByRestaurant(outlet.id);
          allMenuItems.push(...response.data);
        }
        setMenuItems(allMenuItems);
      } else {
        // Load menu items from selected outlet
        const response = await apiService.getMenusByRestaurant(selectedOutletId);
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      showToast('Failed to load menu items.', 'error');
    }
  };

  // Reload menu items when outlet selection changes
  useEffect(() => {
    if (!loading && outlets.length > 0) {
      loadMenuItems();
    }
  }, [selectedOutletId]);

  // Reload menu items when outlets change (after initial load)
  useEffect(() => {
    if (!loading && outlets.length > 0) {
      loadMenuItems();
    }
  }, [outlets]);

  // Get filtered menu items
  const getFilteredMenuItems = () => {
    let allItems = menuItems.map(item => ({
      ...item,
      outletName: item.restaurant?.name || 'Unknown Outlet',
      outletId: item.restaurant_id
    }));

    // Apply search filter
    if (searchTerm) {
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      allItems = allItems.filter(item => item.category === selectedCategory);
    }

    return allItems;
  };

  const handleAddMenuItem = () => {
    if (selectedOutletId === 'all') {
      showToast('Please select a specific outlet to add a menu item.', 'warning');
      return;
    }
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditMenuItem = (item) => {
    setSelectedOutletId(item.restaurant_id.toString());
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteMenuItem = (item) => {
    setItemToDelete(item);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleteLoading(true);
      await apiService.deleteMenu(itemToDelete.id);
      
      // Refresh menu items
      await loadMenuItems();
      
      showToast(`Menu item "${itemToDelete.name}" has been deleted successfully.`, 'success');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast('Failed to delete menu item. Please try again.', 'error');
    } finally {
      setDeleteLoading(false);
      setShowConfirmDelete(false);
      setItemToDelete(null);
    }
  };

  const handleMenuItemSubmit = async (menuData) => {
    try {
      setActionLoading(true);
      
      if (editingItem) {
        // Update existing item
        await apiService.updateMenu(editingItem.id, menuData);
        showToast(`Menu item "${menuData.name}" has been updated successfully.`, 'success');
      } else {
        // Add new item
        await apiService.createMenu(menuData);
        showToast(`Menu item "${menuData.name}" has been added successfully.`, 'success');
      }
      
      // Refresh menu items and close modal
      await loadMenuItems();
      setShowAddModal(false);
      setEditingItem(null);
      
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast(`Failed to ${editingItem ? 'update' : 'add'} menu item. Please try again.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = getFilteredMenuItems();

  if (loading) {
    return (
      <div className="card p-4 shadow-sm">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading menu items...</p>
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
          <p className="text-muted small">Only restaurant owners can manage menu items.</p>
        </div>
      </div>
    );
  }

  // Check if owner has no outlets
  if (outlets.length === 0) {
    return (
      <div className="card p-4 shadow-sm">
        <div className="text-center py-5">
          <Store size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No Outlets Found</h6>
          <p className="text-muted small">
            You need to register at least one restaurant outlet before managing menu items.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 rounded-3" style={{ backgroundColor: '#e8f5e8' }}>
            <Tag size={24} className="text-success" />
          </div>
          <div>
            <h5 className="mb-1 fw-bold">Menu Items Management</h5>
            <p className="text-muted mb-0">Browse and manage menu items across your outlets</p>
          </div>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={handleAddMenuItem}
          disabled={selectedOutletId === 'all'}
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label fw-medium">Select Your Outlet</label>
          <select
            className="form-select"
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(e.target.value)}
          >
            <option value="all">All My Outlets</option>
            {outlets.map(outlet => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-medium">Search Menu Items</label>
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4">
          <label className="form-label fw-medium">Filter by Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          Showing {filteredItems.length} menu item{filteredItems.length !== 1 ? 's' : ''}
          {selectedOutletId !== 'all' && (
            <span> from {outlets.find(o => o.id === parseInt(selectedOutletId))?.name}</span>
          )}
        </div>
        {(searchTerm || selectedCategory !== 'all') && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="row g-4">
          {filteredItems.map((item) => (
            <div key={`${item.outletId}-${item.id}`} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="position-relative">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      className="card-img-top" 
                      alt={item.name}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="card-img-top d-flex align-items-center justify-content-center bg-light"
                      style={{ height: '180px' }}
                    >
                      <div className="text-center text-muted">
                        <Store size={48} className="mb-2" />
                        <small>No Image</small>
                      </div>
                    </div>
                  )}
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-success fs-6">KES {item.price}</span>
                  </div>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <h6 className="card-title fw-bold mb-1">{item.name}</h6>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="d-flex align-items-center gap-1">
                      <Tag size={14} className="text-muted" />
                      <small className="text-muted">{item.category}</small>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <Store size={14} className="text-muted" />
                      <small className="text-muted">{item.outletName}</small>
                    </div>
                  </div>
                  
                  <p className="card-text small text-muted flex-grow-1">{item.description}</p>
                  
                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleEditMenuItem(item)}
                    >
                      <Edit3 size={14} className="me-1" />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDeleteMenuItem(item)}
                    >
                      <Trash2 size={14} className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <Tag size={48} className="text-muted mb-3" />
          <h6 className="text-muted">No menu items found</h6>
          <p className="text-muted small">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Start by adding menu items to your outlets'
            }
          </p>
        </div>
      )}

      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        selectedOutletId={parseInt(selectedOutletId)}
        onSubmit={handleMenuItemSubmit}
        editingItem={editingItem}
        loading={actionLoading}
      />

      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Item"
        confirmVariant="danger"
        loading={deleteLoading}
      />

      <ToastContainer />
    </div>
  );
};
