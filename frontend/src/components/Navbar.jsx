import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, Edit } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { ProfileModal } from './ProfileModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

export default function Navbar({ cartCount = 0 }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, login, logout, updateProfile } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = (userData) => {
    login(userData);
    setShowLoginModal(false);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    const userName = user?.name || 'User';
    logout();
    setShowDropdown(false);
    showToast(`Goodbye, ${userName}! You have been logged out.`, 'info');
    navigate('/');
  };

  const handleUpdateProfile = (updatedUser) => {
    updateProfile(updatedUser);
    setShowProfileModal(false);
    showToast('Profile updated successfully!', 'success');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid px-3">
        <Link className="navbar-brand fw-bold text-danger d-flex align-items-center gap-2" to="/">
          <img 
            src="/logo.png" 
            alt="Nextgen Food Court Logo" 
            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
          />
          Nextgen Food Court
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
<<<<<<< Updated upstream
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
=======
          <ul className="navbar-nav">
            {/* <li className="nav-item">
>>>>>>> Stashed changes
              <Link className="nav-link" to="/restaurant">Restaurants</Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/menu">Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tablebooking">Book Table</Link>
            </li>
            <li className="nav-item position-relative">
              <Link className="nav-link d-flex align-items-center" to="/cart">
                🛒 Cart
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/outlet-dashboard">Dashboard</Link>
              </li>
            )}
            <li className="nav-item ms-3">
              {user ? (
                <div className="dropdown" ref={dropdownRef}>
                  <button 
                    className="btn d-flex align-items-center gap-2 dropdown-toggle"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '4px'
                    }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    type="button"
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="rounded-circle"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: '40px', height: '40px', backgroundColor: '#D67F51', fontSize: '14px' }}
                      >
                        {getInitials(user.name)}
                      </div>
                    )}
                    <span className="fw-medium text-dark d-none d-md-inline">{user.name}</span>
                    <ChevronDown size={16} className="text-muted" />
                  </button>

                  {showDropdown && (
                    <div 
                      className="dropdown-menu dropdown-menu-end show position-absolute"
                      style={{ 
                        top: '100%', 
                        right: '0',
                        minWidth: '200px',
                        borderRadius: '12px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000
                      }}
                    >
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-medium">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 py-2"
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowDropdown(false);
                        }}
                        style={{ border: 'none', background: 'none' }}
                      >
                        <Edit size={16} />
                        Edit Profile
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                        onClick={handleLogout}
                        style={{ border: 'none', background: 'none' }}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="btn d-flex align-items-center gap-2 text-white fw-medium"
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    backgroundColor: '#D67F51',
                    border: 'none',
                    borderRadius: '6px',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#D99467'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#D67F51'}
                >
                  <User size={18} />
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
      />

      <ToastContainer />
    </nav>
  );
}
