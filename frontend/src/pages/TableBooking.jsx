import React, { useState } from 'react';
import Herosection from '../components/Herosection';

export default function TableBooking() {
  const [guests, setGuests] = useState('');

  return (
    <main>
      <Herosection
        title="Reserve a Table"
        subtitle="Book your table up to 30 minutes in advance for a seamless dining experience."
      >
        <div className="container mt-5">
          <div className="row">
          

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h4 className="card-title">
                    <i className="bi bi-calendar3 me-2"></i>Booking Information
                  </h4>
                  <form>
                    <div className="row gx-3">
                      <div className="col-6 mb-3">
                        <label className="form-label">Full Name *</label>
                        <input type="text" className="form-control" placeholder="Enter your name" required />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label">Phone Number *</label>
                        <input type="tel" className="form-control" placeholder="+254 700 000 000" required />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" placeholder="your@email.com" />
                    </div>

                    <div className="row gx-3">
                      <div className="col-4 mb-3">
                        <label className="form-label">Date *</label>
                        <input type="date" className="form-control" required />
                      </div>
                      <div className="col-4 mb-3">
                        <label className="form-label">Time *</label>
                        <select className="form-select" required>
                          <option value="">Select time</option>
                          <option>10:00 AM</option>
                          <option>10:30 AM</option>
                          <option>11:00 AM</option>
                        </select>
                      </div>
                      <div className="col-4 mb-3">
                        <label className="form-label">Guests *</label>
                        <select
                          className="form-select"
                          required
                          value={guests}
                          onChange={e => setGuests(e.target.value)}
                        >
                          <option value="">Number</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Special Requests</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Birthday celebration, wheelchair access, etc."
                      />
                    </div>

                    <button type="submit" className="btn btn-dark">Reserve Table</button>
                  </form>
                </div>
              </div>
            </div>

          
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                  <h4 className="card-title">
                    <i className="bi bi-people me-2"></i>Select Your Table
                  </h4>
                  {guests ? (
                    <p className="text-center text-muted mt-4">
                      <i className="bi bi-table"></i> Available tables for {guests} guests will appear here.
                    </p>
                  ) : (
                    <p className="text-center text-muted mt-4">
                      Please select number of guests first to see available tables
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Herosection>
    </main>
  );
}
