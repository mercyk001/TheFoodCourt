import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, CalendarCheck, ShoppingCart, BarChart3, User, ChevronDown, LogOut, Edit } from 'lucide-react';
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
  const location = useLocation();
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

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/menu', label: 'Menu', icon: <UtensilsCrossed size={18} /> },
    { to: '/tablebooking', label: 'Book Table', icon: <CalendarCheck size={18} /> },
  ];

  if (user?.userType === 'restaurant') {
    navLinks.push({ to: '/outlet-dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, highlight: true });
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container-fluid px-3">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2 text-danger" to="/">
          <img 
            src="/logo.png" 
            alt="Nextgen Food Court Logo" 
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
          Nextgen Food Court
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-3">
            {navLinks.map(({ to, label, icon, highlight }) => (
              <li className="nav-item" key={to}>
                <Link
                  className={`nav-link d-flex align-items-center gap-1 px-3 rounded ${
                    location.pathname === to ? (highlight ? 'bg-light text-danger fw-semibold' : 'text-primary') : 'text-dark'
                  }`}
                  to={to}
                >
                  {icon} {label}
                </Link>
              </li>
            ))}

            <li className="nav-item position-relative">
              <Link className="nav-link d-flex align-items-center gap-1 position-relative" to="/cart">
                <ShoppingCart size={18} /> 
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            <li className="nav-item">
              {user ? (
                <div className="dropdown" ref={dropdownRef}>
                  <button
                    className="btn d-flex align-items-center gap-2 dropdown-toggle"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: '36px', height: '36px', backgroundColor: '#D67F51', fontSize: '14px' }}
                      >
                        {getInitials(user.name)}
                      </div>
                    )}
                    <span className="d-none d-md-inline fw-medium text-dark">{user.name}</span>
                    <ChevronDown size={16} className="text-muted" />
                  </button>

                  {showDropdown && (
                    <div className="dropdown-menu dropdown-menu-end show mt-2 shadow-sm rounded">
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-semibold">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 py-2"
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowDropdown(false);
                        }}
                      >
                        <Edit size={16} />
                        Edit Profile
                      </button>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-warning text-white fw-medium d-flex align-items-center gap-1 px-3"
                  onClick={() => setShowLoginModal(true)}
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
