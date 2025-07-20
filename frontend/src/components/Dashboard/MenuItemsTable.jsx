import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus, DollarSign, Tag, Store, Filter } from 'lucide-react';

const outletsWithMenuItems = [
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
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop"
      },
      {
        id: 2,
        name: "Plantain Chips",
        description: "Crispy fried plantain slices served with spicy dip",
        price: 6.50,
        category: "Appetizer",
        image: "https://images.unsplash.com/photo-1606756790138-261d2b21cd1a?w=400&h=300&fit=crop"
      },
      {
        id: 5,
        name: "Cassava Fufu with Fish Stew",
        description: "Traditional cassava fufu served with rich fish stew",
        price: 12.99,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop"
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
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop"
      },
      {
        id: 6,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese and croutons",
        price: 8.99,
        category: "Salad",
        image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop"
      },
      {
        id: 7,
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers",
        price: 7.50,
        category: "Dessert",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop"
      }
    ]
  },
  {
    id: 3,
    name: "Spice Garden",
    cuisineType: "Indian",
    location: "Ground Floor - Section C",
    menuItems: [
      {
        id: 8,
        name: "Chicken Biryani",
        description: "Aromatic basmati rice with spiced chicken and herbs",
        price: 16.99,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d396?w=400&h=300&fit=crop"
      },
      {
        id: 9,
        name: "Samosas",
        description: "Crispy triangular pastries filled with spiced vegetables",
        price: 5.99,
        category: "Appetizer",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop"
      }
    ]
  },
  {
    id: 4,
    name: "Dragon Wok",
    cuisineType: "Chinese",
    location: "Second Floor - Section A",
    menuItems: [
      {
        id: 10,
        name: "Sweet and Sour Pork",
        description: "Tender pork with bell peppers in sweet and sour sauce",
        price: 14.99,
        category: "Main Course",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
      },
      {
        id: 11,
        name: "Spring Rolls",
        description: "Fresh spring rolls with vegetables and dipping sauce",
        price: 4.99,
        category: "Appetizer",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop"
      }
    ]
  }
];

const AddMenuItemModal = ({ isOpen, onClose, selectedOutletId, onSubmit, editingItem = null }) => {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    description: editingItem?.description || '',
    price: editingItem?.price || '',
    category: editingItem?.category || '',
    image: null
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      id: editingItem?.id || Date.now(),
      outletId: selectedOutletId
    });
    setFormData({ name: '', description: '', price: '', category: '', image: null });
    onClose();
  };

  if (!isOpen) return null;

  const selectedOutlet = outletsWithMenuItems.find(outlet => outlet.id === selectedOutletId);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'} - {selectedOutlet?.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
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
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Price ($)</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description and ingredients"
                  rows={4}
                  required
                />
              </div>

              <div className="d-flex gap-3">
                <button type="button" className="btn btn-secondary flex-fill" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-fill">
                  {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MenuItemsTable = () => {
  const [outlets, setOutlets] = useState(outletsWithMenuItems);
  const [selectedOutletId, setSelectedOutletId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categories = ['all', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Salad', 'Soup', 'Snack'];

  // Get all menu items from selected outlet or all outlets
  const getFilteredMenuItems = () => {
    let allItems = [];
    
    if (selectedOutletId === 'all') {
      outlets.forEach(outlet => {
        outlet.menuItems.forEach(item => {
          allItems.push({
            ...item,
            outletName: outlet.name,
            outletId: outlet.id
          });
        });
      });
    } else {
      const selectedOutlet = outlets.find(outlet => outlet.id === parseInt(selectedOutletId));
      if (selectedOutlet) {
        allItems = selectedOutlet.menuItems.map(item => ({
          ...item,
          outletName: selectedOutlet.name,
          outletId: selectedOutlet.id
        }));
      }
    }

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
      alert('Please select a specific outlet to add a menu item.');
      return;
    }
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditMenuItem = (item) => {
    setSelectedOutletId(item.outletId.toString());
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteMenuItem = (itemId, outletId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setOutlets(outlets.map(outlet => {
        if (outlet.id === outletId) {
          return {
            ...outlet,
            menuItems: outlet.menuItems.filter(item => item.id !== itemId)
          };
        }
        return outlet;
      }));
    }
  };

  const handleMenuItemSubmit = (menuData) => {
    setOutlets(outlets.map(outlet => {
      if (outlet.id === menuData.outletId) {
        if (editingItem) {
          // Update existing item
          return {
            ...outlet,
            menuItems: outlet.menuItems.map(item => 
              item.id === editingItem.id ? { ...item, ...menuData } : item
            )
          };
        } else {
          // Add new item
          return {
            ...outlet,
            menuItems: [...outlet.menuItems, menuData]
          };
        }
      }
      return outlet;
    }));
    setEditingItem(null);
  };

  const filteredItems = getFilteredMenuItems();

  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-3 rounded-3" style={{ backgroundColor: '#e8f5e8' }}>
            <Tag size={24} className="text-success" />
          </div>
          <div>
            <h5 className="mb-1 fw-bold">Menu Items Management</h5>
            <p className="text-muted mb-0">Browse and manage all menu items across outlets</p>
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
          <label className="form-label fw-medium">Select Outlet</label>
          <select
            className="form-select"
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(e.target.value)}
          >
            <option value="all">All Outlets</option>
            {outlets.map(outlet => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name} ({outlet.menuItems.length} items)
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
                  {item.image ? (
                    <img 
                      src={item.image} 
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
                    <span className="badge bg-success fs-6">${item.price}</span>
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
                      onClick={() => handleDeleteMenuItem(item.id, item.outletId)}
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
      />
    </div>
  );
};
