import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container text-center text-md-start">
        <div className="row">
          
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold">Nextgen Food Court</h5>
            <p className="small">
              Discover, order, and enjoy meals from the best outlets at the NextGen Mall — all from one digital platform.
            </p>
          </div>

        
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light text-decoration-none">Home</Link></li>
              <li><Link to="/restaurant" className="text-light text-decoration-none">Restaurants</Link></li>
              <li><Link to="/tablebooking" className="text-light text-decoration-none">Book a Table</Link></li>
              <li><Link to="/cart" className="text-light text-decoration-none">Cart</Link></li>
            </ul>
          </div>

         
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Contact Us</h6>
            <p className="small mb-1">Nextgen Mall, Mombasa Road, Nairobi</p>
            <p className="small mb-1">Phone: +254 700 123 456</p>
            <p className="small">Email: support@nextgenfoodcourt.co.ke</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="text-center small mb-0">&copy; {new Date().getFullYear()} Nextgen Food Court. All rights reserved.</p>
      </div>
    </footer>
  );
}
