import React, { useState } from 'react';
import { User, Building, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [userType, setUserType] = useState('customer'); // 'customer' or 'restaurant'
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    restaurantName: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login/signup logic here
    console.log('Form submitted:', { userType, isSignUp, formData });
    
    // Simulate successful login/signup
    const userData = {
      name: formData.name || 'John Doe',
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
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      restaurantName: '',
      phone: ''
    });
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '550px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', minHeight: '400px', padding: '30px' }}>
          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
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

          <div className="modal-body pt-2">
            {/* User Type Toggle */}
            <div className="d-flex mb-4 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <button
                type="button"
                className={`flex-fill btn ${userType === 'customer' ? 'btn-primary' : 'btn-light'}`}
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  padding: '8px 16px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onClick={() => setUserType('customer')}
              >
                <User size={16} className="me-2" />
                Customer
              </button>
              <button
                type="button"
                className={`flex-fill btn ${userType === 'restaurant' ? 'btn-primary' : 'btn-light'}`}
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  padding: '8px 16px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onClick={() => setUserType('restaurant')}
              >
                <Building size={16} className="me-2" />
                Restaurant
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name Field (Sign Up only) */}
              {isSignUp && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    {userType === 'restaurant' ? 'Owner Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={userType === 'restaurant' ? 'Enter owner name' : 'Enter your full name'}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '12px 16px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              )}

              {/* Restaurant Name (Restaurant Sign Up only) */}
              {isSignUp && userType === 'restaurant' && (
                <div className="mb-3">
                  <label className="form-label fw-medium">Restaurant Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Enter restaurant name"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '12px 16px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label fw-medium">Email Address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '12px 16px 12px 44px',
                      fontSize: '14px'
                    }}
                    required
                  />
                  <Mail 
                    size={18} 
                    className="position-absolute text-muted"
                    style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Phone Field (Sign Up only) */}
              {isSignUp && (
                <div className="mb-3">
                  <label className="form-label fw-medium">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '12px 16px',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>
              )}

              {/* Password Field */}
              <div className="mb-3">
                <label className="form-label fw-medium">Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '12px 44px 12px 44px',
                      fontSize: '14px'
                    }}
                    required
                  />
                  <Lock 
                    size={18} 
                    className="position-absolute text-muted"
                    style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    className="btn position-absolute"
                    style={{ right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div className="mb-3">
                  <label className="form-label fw-medium">Confirm Password</label>
                  <div className="position-relative">
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        padding: '12px 16px 12px 44px',
                        fontSize: '14px'
                      }}
                      required
                    />
                    <Lock 
                      size={18} 
                      className="position-absolute text-muted"
                      style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 fw-medium"
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(0, 123, 255, 0.3)'
                }}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="text-center mt-4">
              <p className="mb-0 text-muted">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className="btn btn-link p-0 ms-1 fw-medium"
                  onClick={switchMode}
                  style={{ textDecoration: 'none' }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Forgot Password (Login only) */}
            {!isSignUp && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="btn btn-link p-0 text-muted"
                  style={{ textDecoration: 'none', fontSize: '14px' }}
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
