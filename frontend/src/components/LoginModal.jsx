import React, { useState } from 'react';
import { User, Building, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import apiService from '../services/api';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login, checkAuthStatus } = useAuth();
  const [userType, setUserType] = useState('customer'); // 'customer' or 'restaurant'
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    restaurantName: '',
    phone: '',
    location: '',
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
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        let registrationMessage = '';
        if (userType === 'customer') {
          await apiService.registerCustomer({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          });
          registrationMessage = `Welcome ${formData.name}! Your customer account has been created successfully. Please log in to continue.`;
        } else {
          await apiService.registerOwner({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            restaurantName: formData.restaurantName,
            location: formData.location,
            cuisineType: formData.cuisineType,
          });
          registrationMessage = `Welcome ${formData.name}! Your restaurant "${formData.restaurantName}" has been registered successfully. Please log in to continue.`;
        }

        // Show success toast
        showToast(registrationMessage, 'success', 5000);

        // Switch to login tab after successful registration
        setIsSignUp(false);
        setError('');
        
        // Clear password fields but keep email for easy login
        const emailToKeep = formData.email;
        resetForm();
        setFormData(prev => ({ ...prev, email: emailToKeep }));
        
      } else {
        // Login
        const loginResponse = await apiService.loginUser(formData.email, formData.password);
        
        // Check if the selected user type matches the backend role
        const backendRole = loginResponse.data.role;
        const expectedRole = userType === 'restaurant' ? 'owner' : 'customer';
        
        if (backendRole !== expectedRole) {
          // Role mismatch - show invalid credentials error
          if (userType === 'restaurant') {
            throw new Error('Invalid credentials. This account is not registered as a restaurant owner.');
          } else {
            throw new Error('Invalid credentials. This account is not registered as a customer.');
          }
        }

        let userData;
        
        // Check if login response contains user data directly
        if (loginResponse.data && (loginResponse.data.user || loginResponse.data.id || loginResponse.data.username)) {
          userData = loginResponse.data.user || loginResponse.data;
        } else {
          // If login response doesn't contain user data, get user profile
          // Add a delay to ensure JWT cookie/token is processed
          await new Promise(resolve => setTimeout(resolve, 300));
          
          try {
            const profileResponse = await apiService.getUserProfile();
            userData = profileResponse.data;
            console.log('Profile data retrieved:', userData);
          } catch (profileError) {
            console.error('Profile retrieval failed:', profileError);
            console.log('Login response was:', loginResponse);
            
            // If getting profile fails, try to extract info from login response
            if (loginResponse.data && (loginResponse.data.access_token || loginResponse.data.token)) {
              throw new Error('Login successful and JWT token received, but profile retrieval failed. This suggests the backend JWT configuration needs adjustment.');
            }
            
            // Provide more specific error message
            if (profileError.message.includes('401') || profileError.message.includes('Unauthorized')) {
              throw new Error('Login successful but JWT authentication failed. The backend may not be setting the JWT cookie properly or the token format is incorrect.');
            }
            
            throw new Error('Login successful but unable to retrieve user profile. ' + profileError.message);
          }
        }

        // Transform backend role to frontend userType
        const userDataFormatted = {
          id: userData.id,
          name: userData.username || userData.name,
          email: userData.email,
          phone: userData.phone || userData.phone_number,
          userType: userData.role === 'owner' ? 'restaurant' : 'customer',
          role: userData.role,
          avatar: null,
          restaurants: userData.restaurants || []
        };

        // Update AuthContext with the formatted user data
        login(userDataFormatted);

        if (onLoginSuccess) {
          onLoginSuccess(userDataFormatted);
        }

        onClose();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      restaurantName: '',
      phone: '',
      location: '',
      cuisineType: ''
    });
    setError('');
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
              {/* Error Message */}
              {error && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '14px', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              {/* Name Field (Sign Up only) */}
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
                    placeholder={userType === 'restaurant' ? 'Enter owner name' : 'Enter your full name'}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    required
                    disabled={loading}
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
                    placeholder="Enter restaurant name"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Location (Restaurant Sign Up only) */}
              {isSignUp && userType === 'restaurant' && (
                <div className="mb-2">
                  <label className="form-label fw-medium small mb-1">Location</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter restaurant location"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Cuisine Type (Restaurant Sign Up only) */}
              {isSignUp && userType === 'restaurant' && (
                <div className="mb-2">
                  <label className="form-label fw-medium small mb-1">Cuisine Type</label>
                  <select
                    className="form-control form-control-sm"
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleChange}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '10px 14px',
                      fontSize: '14px'
                    }}
                    disabled={loading}
                  >
                    <option value="">Select cuisine type</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Nigerian">Nigerian</option>
                    <option value="Congolese">Congolese</option>
                    <option value="Ethiopian">Ethiopian</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
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
                className="btn btn-primary w-100 fw-medium mb-3 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: loading ? '#6c757d' : '#D67F51',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '15px',
                  border: 'none',
                  boxShadow: '0 3px 12px rgba(0, 123, 255, 0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div 
                      className="spinner-border spinner-border-sm me-2" 
                      role="status"
                      style={{ width: '16px', height: '16px' }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
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
      
      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
};
