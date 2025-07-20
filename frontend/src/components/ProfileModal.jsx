

import React from 'react';
import { Button } from 'react-bootstrap'; 

export default function ProfileModal({ isOpen, onClose, user, onUpdateProfile }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: e.target.name.value,
      email: e.target.email.value,
    };
    onUpdateProfile(updatedUser);
  };

  return (
    <div className="modal show" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Profile</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input name="name" className="form-control" defaultValue={user?.name} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" defaultValue={user?.email} required />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
