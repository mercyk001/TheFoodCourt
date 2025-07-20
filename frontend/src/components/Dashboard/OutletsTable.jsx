import React, { useState } from 'react';
import { Store, Edit3, Trash2, Plus, Upload, X } from 'lucide-react';

const initialOutlets = [
  {
    id: 1,
    name: "Mama's Kitchen",
    cuisineType: "African",
    location: "Ground Floor - Section A"
  },
  {
    id: 2,
    name: "Pizza Palace",
    cuisineType: "Italian",
    location: "First Floor - Section B"
  },
  {
    id: 3,
    name: "Spice Garden",
    cuisineType: "Indian",
    location: "Ground Floor - Section C"
  },
  {
    id: 4,
    name: "Dragon Wok",
    cuisineType: "Chinese",
    location: "Second Floor - Section A"
  }
];

const AddMenuItemModal = ({ isOpen, onClose, outletName, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({ name: '', description: '', image: null });
    setImagePreview(null);
    onClose();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: null });
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              Add Menu Item - {outletName}
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body pt-2">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-medium">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter menu item name"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '12px 16px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description and ingredients"
                  rows={4}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '12px 16px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Upload Image</label>
                <div className="border rounded-3 p-4" style={{ backgroundColor: '#f8f9fa' }}>
                  {imagePreview ? (
                    <div className="text-center">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="img-fluid rounded mb-3"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={48} className="text-muted mb-3" />
                      <div className="mb-2">
                        <label htmlFor="imageUpload" className="btn btn-outline-primary">
                          Choose Image
                        </label>
                        <input
                          type="file"
                          id="imageUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      <p className="text-muted small mb-0">
                        Upload an image of your menu item (JPG, PNG, etc.)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-secondary flex-fill"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  style={{ borderRadius: '8px', padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-fill"
                  style={{
                    borderRadius: '8px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    border: 'none'
                  }}
                >
                  Add Menu Item
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
  const [outlets, setOutlets] = useState(initialOutlets);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (outlet) => {
    setEditingId(outlet.id);
    setEditForm({
      name: outlet.name,
      cuisineType: outlet.cuisineType,
      location: outlet.location
    });
  };

  const handleSaveEdit = (id) => {
    setOutlets(outlets.map(outlet => 
      outlet.id === id ? { ...outlet, ...editForm } : outlet
    ));
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this outlet?')) {
      setOutlets(outlets.filter(outlet => outlet.id !== id));
    }
  };

  const handleAddMenuItem = (outlet) => {
    setSelectedOutlet(outlet);
    setShowAddModal(true);
  };

  const handleMenuItemSubmit = (menuData) => {
    console.log('New menu item for', selectedOutlet.name, ':', menuData);
    // Here you would typically send this data to your backend
    // For now, we'll just log it
    alert(`Menu item "${menuData.name}" added to ${selectedOutlet.name}!`);
  };

  const cuisineTypes = [
    'African', 'Italian', 'Chinese', 'Indian', 'Mexican', 
    'Japanese', 'American', 'Mediterranean', 'Thai', 'French'
  ];

  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 rounded-3" style={{ backgroundColor: '#e3f2fd' }}>
            <Store size={24} className="text-primary" />
          </div>
          <div>
            <h5 className="mb-1 fw-bold">Outlet Management</h5>
            <p className="text-muted mb-0">Manage your restaurant outlets</p>
          </div>
        </div>
        <div className="badge bg-primary fs-6 px-3 py-2">
          {outlets.length} Outlets
        </div>
      </div>

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
            {outlets.map((outlet) => (
              <tr key={outlet.id}>
                <td>
                  {editingId === outlet.id ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Outlet name"
                    />
                  ) : (
                    <div className="fw-semibold">{outlet.name}</div>
                  )}
                </td>
                <td>
                  {editingId === outlet.id ? (
                    <select
                      className="form-select form-select-sm"
                      value={editForm.cuisineType}
                      onChange={(e) => setEditForm({...editForm, cuisineType: e.target.value})}
                    >
                      {cuisineTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="badge bg-light text-dark">{outlet.cuisineType}</span>
                  )}
                </td>
                <td>
                  {editingId === outlet.id ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      placeholder="Location within food court"
                    />
                  ) : (
                    <div className="text-muted">{outlet.location}</div>
                  )}
                </td>
                <td>
                  {editingId === outlet.id ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleSaveEdit(outlet.id)}
                        title="Save changes"
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleCancelEdit}
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(outlet)}
                        title="Edit outlet"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(outlet.id)}
                        title="Delete outlet"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        onClick={() => handleAddMenuItem(outlet)}
                        title="Add menu item"
                      >
                        <Plus size={14} />
                        Menu
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddMenuItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        outletName={selectedOutlet?.name}
        onSubmit={handleMenuItemSubmit}
      />
    </div>
  );
}
