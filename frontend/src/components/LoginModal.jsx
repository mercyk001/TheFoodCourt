import React, { useState } from 'react';
import { User, Building, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [userType, setUserType] = useState('customer'); // 'customer' or 'restaurant'
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    restaurantName: '',
    restaurantLocation: '',
    cuisineType: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Handle login/signup logic here
    console.log('Form submitted:', { userType, isSignUp, formData });
    
    // Simulate successful login/signup
    const userData = {
      name: formData.name || 'Guest',
      email: formData.email,
      userType: userType,
      avatar: null // Default no avatar
    };
    
    // Call the success callback with user data
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
    
    onClose();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      restaurantName: '',
      restaurantLocation: '',
      cuisineType: ''
    });
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '15px'
      }}
    >
      <div 
        className="modal-dialog modal-dialog-centered" 
        style={{ 
          maxWidth: '500px',
          height: 'auto',
          maxHeight: '95vh',
          margin: '0 auto'
        }}
      >
        <div 
          className="modal-content border-0 shadow-lg" 
          style={{ 
            borderRadius: '16px', 
            height: 'auto',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div className="modal-header border-0 p-4 pb-2 flex-shrink-0">
            <h5 className="modal-title fw-bold mb-0">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem' }}
            >
              <X size={20} />
            </button>
          </div>

          <div 
            className="modal-body p-4 pt-0" 
            style={{ 
              overflowY: 'auto',
              flex: '1 1 auto'
            }}
          >
            {/* User Type Toggle */}
            <div className="d-flex mb-3 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <button
                type="button"
                className={`flex-fill btn ${userType === 'customer' ? 'btn-primary' : 'btn-light'}`}
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  padding: '6px 12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onClick={() => setUserType('customer')}
              >
                <User size={14} className="me-1" />
                Customer
              </button>
              <button
                type="button"
                className={`flex-fill btn ${userType === 'restaurant' ? 'btn-primary' : 'btn-light'}`}
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  padding: '6px 12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onClick={() => setUserType('restaurant')}
              >
                <Building size={14} className="me-1" />
                Restaurant
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Username Field (Sign Up only) */}
              {isSignUp && (
                <div className="mb-2">
                  <label className="form-label fw-medium small mb-1">
                    {userType === 'restaurant' ? 'Owner Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter username"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              )}

              {/* Restaurant Name (Restaurant Sign Up only) */}
              {isSignUp && userType === 'restaurant' && (
                <div className="mb-2">
                  <label className="form-label fw-medium small mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              )}

              {/* Restaurant Fields (Restaurant Sign Up only) */}
              {isSignUp && userType === 'restaurant' && (
                <>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Restaurant Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                        placeholder="e.g., Sam's Grill"
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium">Cuisine Type</label>
                      <select
                        className="form-select"
                        name="cuisineType"
                        value={formData.cuisineType}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                        required
                      >
                        <option value="">Select cuisine type</option>
                        <option value="Kenyan">Kenyan</option>
                        <option value="African">African</option>
                        <option value="Italian">Italian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Indian">Indian</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Japanese">Japanese</option>
                        <option value="American">American</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="Thai">Thai</option>
                        <option value="French">French</option>
                        <option value="Fast Food">Fast Food</option>
                        <option value="Continental">Continental</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-medium">Restaurant Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="restaurantLocation"
                      value={formData.restaurantLocation}
                      onChange={handleChange}
                      placeholder="e.g., NextGen Mall - 2nd Floor"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="mb-2">
                <label className="form-label fw-medium small mb-1">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px 10px 36px',
                      fontSize: '14px'
                    }}
                    required
                  />
                  <Mail 
                    size={16} 
                    className="position-absolute text-muted"
                    style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Phone Field (Sign Up only) */}
              {isSignUp && (
                <div className="mb-2">
                  <label className="form-label fw-medium small mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              )}

              {/* Password Field */}
              <div className="mb-2">
                <label className="form-label fw-medium small mb-1">Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control form-control-sm"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 36px 10px 36px',
                      fontSize: '14px'
                    }}
                    required
                  />
                  <Lock 
                    size={16} 
                    className="position-absolute text-muted"
                    style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    className="btn position-absolute"
                    style={{ right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', padding: '4px' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        padding: '10px 14px 10px 36px',
                        fontSize: '14px'
                      }}
                      required
                    />
                    <Lock 
                      size={16} 
                      className="position-absolute text-muted"
                      style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 fw-medium mb-3"
                style={{
                  backgroundColor: '#D67F51',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '15px',
                  border: 'none',
                  boxShadow: '0 3px 12px rgba(0, 123, 255, 0.3)'
                }}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="text-center mb-2">
              <p className="mb-0 text-muted small">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className="btn btn-link p-0 ms-1 fw-medium small"
                  onClick={switchMode}
                  style={{ textDecoration: 'none' }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Forgot Password (Login only) */}
            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link p-0 text-muted"
                  style={{ textDecoration: 'none', fontSize: '13px' }}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
