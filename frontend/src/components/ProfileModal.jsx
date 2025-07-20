import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Upload, X } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (!formData.currentPassword) {
        alert('Current password is required to change password');
        return;
      }
    }

    // Update user profile
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      avatar: avatarPreview
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Edit Profile</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body pt-2">
            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="rounded-circle"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: '100px', height: '100px' }}
                    >
                      <User size={40} className="text-muted" />
                    </div>
                  )}
                  <label 
                    htmlFor="avatarUpload" 
                    className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-2"
                    style={{ cursor: 'pointer' }}
                  >
                    <Upload size={14} />
                  </label>
                  <input
                    type="file"
                    id="avatarUpload"
                    className="d-none"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-muted small mt-2">Click the upload icon to change your avatar</p>
              </div>

              {/* Name Field */}
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

              {/* Password Change Section */}
              <div className="border-top pt-3 mt-4">
                <h6 className="fw-medium mb-3">Change Password (Optional)</h6>
                
                {/* Current Password */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Current Password</label>
                  <div className="position-relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-control"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        padding: '12px 44px 12px 44px',
                        fontSize: '14px'
                      }}
                    />
                    <Lock 
                      size={18} 
                      className="position-absolute text-muted"
                      style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <button
                      type="button"
                      className="position-absolute bg-transparent border-0"
                      style={{ right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label className="form-label fw-medium">New Password</label>
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        padding: '12px 44px 12px 44px',
                        fontSize: '14px'
                      }}
                    />
                    <Lock 
                      size={18} 
                      className="position-absolute text-muted"
                      style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <button
                      type="button"
                      className="position-absolute bg-transparent border-0"
                      style={{ right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="mb-3">
                  <label className="form-label fw-medium">Confirm New Password</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        padding: '12px 44px 12px 44px',
                        fontSize: '14px'
                      }}
                    />
                    <Lock 
                      size={18} 
                      className="position-absolute text-muted"
                      style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <button
                      type="button"
                      className="position-absolute bg-transparent border-0"
                      style={{ right: '14px', top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 mt-4">
                <button type="button" className="btn btn-secondary flex-fill" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-fill">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
