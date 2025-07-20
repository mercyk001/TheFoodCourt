
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { LoginModal } from './LoginModal';

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid px-3">
        <Link className="navbar-brand fw-bold text-danger" to="/">Nextgen Food Court</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/restaurant">Restaurants</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/menu/1">Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tablebooking">Book Table</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart">Cart</Link>
            </li>
            <li className="nav-item ms-auto">
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
            </li>
          </ul>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </nav>
  );
}
