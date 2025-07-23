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

  const BASE_URL = "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // ✅ Endpoint & Payload
    let endpoint = "";
    let payload = {};

    if (isSignUp) {
      if (userType === "customer") {
        endpoint = "/users/register/customer";
        payload = {
          username: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };
      } else {
        endpoint = "/users/register/owner";
        payload = {
          username: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          restaurant: {
            name: formData.restaurantName,
            location: formData.restaurantLocation,
            cuisine_type: formData.cuisineType
          }
        };
      }
    } else {
      endpoint = userType === "customer" ? "/users/login/customer" : "/users/login/owner";
      payload = {
        email: formData.email,
        password: formData.password
      };
    }

    // ✅ API Request
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong.");
        return;
      }

      // ✅ Handle Login Response
      if (!isSignUp) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userData", JSON.stringify(data.user));

        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      } else {
        alert("Account created successfully. Please login.");
        setIsSignUp(false);
      }

      onClose();
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Try again later.");
    }
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '15px' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header border-0 p-4 pb-2 flex-shrink-0">
            <h5 className="modal-title fw-bold mb-0">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} style={{ background: 'none', border: 'none' }}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body p-4 pt-0" style={{ overflowY: 'auto', flex: '1 1 auto' }}>
            {/* User Type Toggle */}
            <div className="d-flex mb-3 p-1" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <button type="button" className={`flex-fill btn ${userType === 'customer' ? 'btn-primary' : 'btn-light'}`} onClick={() => setUserType('customer')}>
                <User size={14} className="me-1" /> Customer
              </button>
              <button type="button" className={`flex-fill btn ${userType === 'restaurant' ? 'btn-primary' : 'btn-light'}`} onClick={() => setUserType('restaurant')}>
                <Building size={14} className="me-1" /> Restaurant
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              {isSignUp && (
                <div className="mb-2">
                  <label className="form-label small mb-1">{userType === 'restaurant' ? 'Owner Name' : 'Full Name'}</label>
                  <input type="text" name="name" className="form-control form-control-sm" value={formData.name} onChange={handleChange} required />
                </div>
              )}

              {/* Restaurant Fields */}
              {isSignUp && userType === 'restaurant' && (
                <>
                  <div className="mb-2">
                    <label className="form-label small mb-1">Restaurant Name</label>
                    <input type="text" name="restaurantName" className="form-control form-control-sm" value={formData.restaurantName} onChange={handleChange} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-1">Cuisine Type</label>
                    <select name="cuisineType" className="form-select form-select-sm" value={formData.cuisineType} onChange={handleChange} required>
                      <option value="">Select cuisine type</option>
                      <option>Kenyan</option>
                      <option>African</option>
                      <option>Italian</option>
                      <option>Chinese</option>
                      <option>Indian</option>
                      <option>Mexican</option>
                      <option>Japanese</option>
                      <option>American</option>
                      <option>Mediterranean</option>
                      <option>Thai</option>
                      <option>French</option>
                      <option>Fast Food</option>
                      <option>Continental</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small mb-1">Restaurant Location</label>
                    <input type="text" name="restaurantLocation" className="form-control form-control-sm" value={formData.restaurantLocation} onChange={handleChange} required />
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="mb-2">
                <label className="form-label small mb-1">Email Address</label>
                <div className="position-relative">
                  <input type="email" name="email" className="form-control form-control-sm" value={formData.email} onChange={handleChange} required />
                  <Mail size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Phone Number (Signup only) */}
              {isSignUp && (
                <div className="mb-2">
                  <label className="form-label small mb-1">Phone Number</label>
                  <input type="tel" name="phone" className="form-control form-control-sm" value={formData.phone} onChange={handleChange} required />
                </div>
              )}

              {/* Password Field */}
              <div className="mb-2">
                <label className="form-label small mb-1">Password</label>
                <div className="position-relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-control form-control-sm" value={formData.password} onChange={handleChange} required />
                  <Lock size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button type="button" className="btn position-absolute" onClick={() => setShowPassword(!showPassword)} style={{ right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              {isSignUp && (
                <div className="mb-3">
                  <label className="form-label small mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" className="form-control form-control-sm" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="btn btn-primary w-100 mb-3" style={{ backgroundColor: '#D67F51', border: 'none' }}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="text-center mb-2">
              <p className="small text-muted">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button type="button" className="btn btn-link p-0 ms-1 small" onClick={switchMode} style={{ textDecoration: 'none' }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {!isSignUp && (
              <div className="text-center">
                <button className="btn btn-link text-muted small" style={{ textDecoration: 'none' }}>
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
