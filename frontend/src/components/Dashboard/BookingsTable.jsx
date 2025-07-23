import { useState } from "react";
import { Check, X, Phone, Mail, Calendar, Users } from "lucide-react";

const initialBookings = [
  {
    id: 1,
    customerName: "peter karanja",
    phone: "+254722123456",
    email: "john.doe@email.com",
    date: "2025-07-20",
    time: "7:00 PM",
    partySize: 4,
    tableNumber: "Table 5",
    specialRequests: "Window seat preferred",
    status: "Confirmed"
  },
  {
    id: 2,
    customerName: "Jane Smith",
    phone: "+254711987654",
    email: "jane.smith@email.com",
    date: "2025-07-21", 
    time: "6:30 PM",
    partySize: 2,
    tableNumber: "Table 2",
    specialRequests: "Vegetarian options",
    status: "Pending"
  },
  {
    id: 3,
    customerName: "Mike Johnson",
    phone: "+254733456789",
    email: "mike.j@email.com",
    date: "2025-07-22",
    time: "8:00 PM",
    partySize: 6,
    tableNumber: "Table 8",
    specialRequests: "Birthday celebration",
    status: "Pending"
  },
  {
    id: 4,
    customerName: "Sarah Wilson",
    phone: "+254799123456",
    email: "sarah.w@email.com",
    date: "2025-07-20",
    time: "5:30 PM",
    partySize: 3,
    tableNumber: "Table 3",
    specialRequests: "",
    status: "Confirmed"
  }
];

export const BookingsTable = () => {
  const [bookings, setBookings] = useState(initialBookings);

  const handleConfirmBooking = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: "Confirmed" }
        : booking
    ));
  };

  const handleRejectBooking = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: "Rejected" }
        : booking
    ));
  };

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus }
        : booking
    ));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Confirmed":
        return "bg-success text-white";
      case "Seated":
        return "bg-info text-white";
      case "Completed":
        return "bg-dark text-white";
      case "Rejected":
        return "bg-danger text-white";
      case "No Show":
        return "bg-secondary text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const statusOptions = ["Confirmed", "Seated", "Completed"];

  return (
    <div className="card p-4 shadow-sm">
      <h5 className="mb-3">Table Bookings</h5>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead style={{ backgroundColor: "#FFFBF7" }}>
            <tr>
              <th>Customer Details</th>
              <th>Date & Time</th>
              <th>Party Size</th>
              <th>Table</th>
              <th>Special Requests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <div className="fw-semibold">{booking.customerName}</div>
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Phone size={12} />
                    {booking.phone}
                  </div>
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Mail size={12} />
                    {booking.email}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1 fw-medium">
                    <Calendar size={14} />
                    {booking.date}
                  </div>
                  <div className="text-muted small">{booking.time}</div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <Users size={14} />
                    <span className="fw-medium">{booking.partySize}</span> people
                  </div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">{booking.tableNumber}</span>
                </td>
                <td>
                  <span className="text-muted small" style={{ maxWidth: "150px", display: "block" }}>
                    {booking.specialRequests || "None"}
                  </span>
                </td>
                <td>
                  {(booking.status === "Pending" || booking.status === "Rejected" || booking.status === "No Show") ? (
                    <span className={`badge rounded-pill ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  ) : (
                    <select
                      className="form-select form-select-sm"
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      style={{
                        minWidth: "120px",
                        backgroundColor: booking.status === "Completed" ? "#f8f9fa" : "white"
                      }}
                      disabled={booking.status === "Completed"}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  {booking.status === "Pending" ? (
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-success d-flex align-items-center gap-1"
                        onClick={() => handleConfirmBooking(booking.id)}
                        title="Confirm Booking"
                      >
                        <Check size={14} />
                        Confirm
                      </button>
                      <button 
                        className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                        onClick={() => handleRejectBooking(booking.id)}
                        title="Reject Booking"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  ) : booking.status === "Rejected" ? (
                    <span className="text-muted small">Booking Rejected</span>
                  ) : booking.status === "Completed" ? (
                    <span className="text-success small fw-medium">✓ Completed</span>
                  ) : booking.status === "No Show" ? (
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleStatusChange(booking.id, "Pending")}
                      title="Reactivate Booking"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <div className="d-flex gap-1">
                      <span className="text-info small">In Progress</span>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleStatusChange(booking.id, "No Show")}
                        title="Mark as No Show"
                      >
                        No Show
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
