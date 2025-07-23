import React, { useState, useEffect } from 'react';
import Herosection from '../components/Herosection';
import { FaUser } from 'react-icons/fa';
import axios from 'axios';

export default function TableBooking() {
  const [partySize, setPartySize] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [tables, setTables] = useState([]);
  

  

  const filteredTables = partySize
    ? tables.filter((t) => t.capacity >= parseInt(partySize))
    : tables;

  const handleReserve = (tableId) => {
    alert(`✅ Table ${tableId} reserved for ${partySize} people on ${selectedDate} at ${selectedTime}`);
  };


   useEffect(() => {
    axios.get('http://localhost:5000/tables')
      .then(response => setTables(response.data))
      .catch(error => console.error('Error fetching tables:', error));
  }, []);


  return (
    <main>
      <Herosection
        title="Reserve Your Table"
        subtitle="Book a table up to 30 minutes in advance and enjoy your meal without the wait. All tables are first-come, first-served."
      >
        <div className="container mt-4">
          <div className="row">
            {/* Left Booking Form */}
            <div className="col-md-6 mb-4">
              <div className="card p-4 shadow-sm">
                <h5 className="mb-3">📝 Booking Information</h5>

                <div className="mb-3">
                  <label className="form-label">Party Size *</label>
                  <select
                    className="form-select"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    required
                  >
                    <option value="">Select party size</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Time *</label>
                  <select
                    className="form-select"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  >
                    <option value="">Select time</option>
                    <option>10:00 AM</option>
                    <option>12:00 PM</option>
                    <option>2:00 PM</option>
                    <option>4:00 PM</option>
                    <option>6:00 PM</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Special Requests</label>
                  <textarea
                    className="form-control"
                    placeholder="Any special requests or dietary requirements..."
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Available Tables */}
            <div className="col-md-6 mb-4">
              <div className="card p-4 shadow-sm">
                <h5 className="mb-3">📍 Available Tables</h5>

                {filteredTables.length ? (
                  filteredTables.map((table) => (
                    <div
                      key={table.id}
                      className="border rounded p-3 mb-3 d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>Table {table.id}</strong>{' '}
                        <span className="ms-2 text-muted">
                          <FaUser className="me-1" />
                          {table.capacity}
                        </span>
                        <div className="text-muted small">{table.location}</div>
                      </div>
                      <button
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => handleReserve(table.id)}
                      >
                        Reserve
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No tables found for selected party size.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Herosection>
    </main>
  );
}
