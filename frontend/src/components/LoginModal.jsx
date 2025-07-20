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
    if (isSignUp && userType === 'restaurant') {
      // Format data for restaurant signup
      const restaurantSignupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        restaurant: {
          name: formData.restaurantName,
          location: formData.restaurantLocation,
          cuisine_type: formData.cuisineType
        }
      };
      try {
        const response = await fetch('http://localhost:5000/users/register/owner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(restaurantSignupData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        console.log('Restaurant signup successful:', data);
        
        // After successful registration, automatically log them in
        const loginData = {
          email: formData.email,
          password: formData.password
        };
        
        const loginResponse = await fetch('http://localhost:5000/users/login/owner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        });
        
        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          localStorage.setItem('accessToken', loginResult.access_token);
          localStorage.setItem('userRole', loginResult.role);
          localStorage.setItem('userData', JSON.stringify(loginResult.user));
          
          const userData = {
            name: loginResult.user.username,
            email: loginResult.user.email,
            userType: loginResult.role,
            avatar: null,
            ...loginResult.user
          };
          
          if (onLoginSuccess) {
            onLoginSuccess(userData);
          }
        } else {
          // Fallback to manual user data if auto-login fails
          const userData = {
            name: formData.username,
            email: formData.email,
            userType: userType,
            avatar: null
          };
          
          if (onLoginSuccess) {
            onLoginSuccess(userData);
          }
        }
      } catch (error) {
        console.error('Error during restaurant signup:', error);
        alert('Registration failed: ' + error.message);
        return; // Don't close modal on error
      }
      console.log('Restaurant signup data:', restaurantSignupData);
    } else {
      // Handle regular login or customer signup
      if (isSignUp && userType === 'customer') {
        // Handle customer signup
        const customerSignupData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };
        
        try {
          const response = await fetch('http://localhost:5000/users/register/customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerSignupData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
          }

          const data = await response.json();
          console.log('Customer signup successful:', data);
          
          // After successful registration, automatically log them in
          const loginData = {
            email: formData.email,
            password: formData.password
          };
          
          const loginResponse = await fetch('http://localhost:5000/users/login/customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
          });
          
          if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            localStorage.setItem('accessToken', loginResult.access_token);
            localStorage.setItem('userRole', loginResult.role);
            localStorage.setItem('userData', JSON.stringify(loginResult.user));
            
            const userData = {
              name: loginResult.user.username,
              email: loginResult.user.email,
              userType: loginResult.role,
              avatar: null,
              ...loginResult.user
            };
            
            if (onLoginSuccess) {
              onLoginSuccess(userData);
            }
          } else {
            // Fallback if auto-login fails
            const userData = {
              name: formData.name || formData.username,
              email: formData.email,
              userType: userType,
              avatar: null
            };
            
            if (onLoginSuccess) {
              onLoginSuccess(userData);
            }
          }
        } catch (error) {
          console.error('Error during customer signup:', error);
          alert('Registration failed: ' + error.message);
          return; // Don't close modal on error
        }
      } else if (!isSignUp) {
        // Handle login based on user type
        const loginData = {
          email: formData.email,
          password: formData.password
        };
        
        // Use specific login endpoint based on user type
        const loginEndpoint = userType === 'restaurant' 
          ? 'http://localhost:5000/users/login/owner'
          : 'http://localhost:5000/users/login/customer';
        
        try {
          const response = await fetch(loginEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
          }

          const data = await response.json();
          console.log('Login successful:', data);
          
          // Store the access token and user data
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userData', JSON.stringify(data.user));
          
          const userData = {
            name: data.user.username,
            email: data.user.email,
            userType: data.role,
            avatar: null,
            ...data.user
          };
          
          if (onLoginSuccess) {
            onLoginSuccess(userData);
          }
        } catch (error) {
          console.error('Error during login:', error);
          alert('Login failed: ' + error.message);
          return; // Don't close modal on error
        }
      }
      
      console.log('Form submitted:', { userType, isSignUp, formData });
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: isSignUp && userType === 'restaurant' ? '600px' : '450px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
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
              {/* Username Field (Sign Up only) */}
              {isSignUp && (
                <div className="mb-3">
                  <label className="form-label fw-medium">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
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

              {/* Name Field (Sign Up only) */}
              {isSignUp && userType === 'customer' && (
                <div className="mb-3">
                  <label className="form-label fw-medium">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
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
