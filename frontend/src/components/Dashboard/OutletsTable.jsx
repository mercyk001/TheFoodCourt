import React, { useState } from 'react';
import { Store, Edit3, Trash2, Plus } from 'lucide-react';

const initialOutlets = [
  {
    id: 1,
    name: "Mama's Kitchen",
    cuisineType: "African",
    location: "Ground Floor - Section A",
    menuItems: [
      {
        id: 1,
        name: "Jollof Rice with Grilled Chicken",
        description: "Spicy West African rice dish served with tender grilled chicken",
        price: 15.99,
        category: "Main Course",
        image: null
      },
      {
        id: 2,
        name: "Plantain Chips",
        description: "Crispy fried plantain slices served with spicy dip",
        price: 6.50,
        category: "Appetizer",
        image: null
      }
    ]
  },
  {
    id: 2,
    name: "Pizza Palace",
    cuisineType: "Italian",
    location: "First Floor - Section B",
    menuItems: [
      {
        id: 3,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
        price: 18.99,
        category: "Main Course",
        image: null
      }
    ]
  },
  {
    id: 3,
    name: "Spice Garden",
    cuisineType: "Indian",
    location: "Ground Floor - Section C",
    menuItems: []
  },
  {
    id: 4,
    name: "Dragon Wok",
    cuisineType: "Chinese",
    location: "Second Floor - Section A",
    menuItems: []
  }
];

const AddOutletModal = ({ isOpen, onClose, onSubmit, editingOutlet = null }) => {
  const [formData, setFormData] = useState({
    name: editingOutlet?.name || '',
    cuisineType: editingOutlet?.cuisineType || '',
    location: editingOutlet?.location || ''
  });

  const cuisineTypes = [
    'African', 'Italian', 'Chinese', 'Indian', 'Mexican', 
    'Japanese', 'American', 'Mediterranean', 'Thai', 'French'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: editingOutlet?.id || Date.now(),
      menuItems: editingOutlet?.menuItems || []
    });
    setFormData({ name: '', cuisineType: '', location: '' });
    onClose();
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
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Cuisine Type</label>
                <select
                  className="form-select"
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleChange}
                  required
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
                />
              </div>

              <div className="d-flex gap-3">
                <button type="button" className="btn btn-secondary flex-fill" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-fill">
                  {editingOutlet ? 'Update Outlet' : 'Add Outlet'}
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
  const [showAddOutletModal, setShowAddOutletModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet);
    setShowAddOutletModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this outlet?')) {
      setOutlets(outlets.filter(outlet => outlet.id !== id));
    }
  };

  const handleOutletSubmit = (outletData) => {
    if (editingOutlet) {
      // Update existing outlet
      setOutlets(outlets.map(outlet => 
        outlet.id === editingOutlet.id ? { ...outlet, ...outletData } : outlet
      ));
    } else {
      // Add new outlet
      setOutlets([...outlets, outletData]);
    }
    setEditingOutlet(null);
  };

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
        >
          <Plus size={18} />
          Add Outlet
        </button>
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
                  <div className="fw-semibold">{outlet.name}</div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">{outlet.cuisineType}</span>
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
                  </div>
                </td>
              </tr>
            ))}
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
      />
    </div>
  );
}
