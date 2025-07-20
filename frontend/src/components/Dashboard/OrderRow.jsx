import { Check, X } from "lucide-react";

export const OrderRow = ({
  orderId,
  customer,
  items,
  total,
  status,
  phone,
  table,
  onAccept,
  onReject,
  onStatusChange,
}) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark";
      case "Accepted":
        return "bg-info text-white";
      case "Preparing":
        return "bg-primary text-white";
      case "Ready":
        return "bg-success text-white";
      case "Delivered":
        return "bg-success text-white";
      case "Completed":
        return "bg-dark text-white";
      case "Rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const statusOptions = ["Accepted", "Preparing", "Ready", "Delivered", "Completed"];

  return (
    <tr>
      <td className="fw-medium">{orderId}</td>
      <td>
        <div className="fw-semibold">{customer}</div>
        {phone && <div className="text-muted small">{phone}</div>}
        {table && <div className="text-muted small">{table}</div>}
      </td>
      <td className="text-wrap" style={{ maxWidth: "200px" }}>{items}</td>
      <td className="fw-bold text-success">{total}</td>
      <td>
        {(status === "Pending" || status === "Rejected") ? (
          <span className={`badge rounded-pill ${getStatusBadgeClass(status)}`}>
            {status}
          </span>
        ) : (
          <select
            className="form-select form-select-sm"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{
              minWidth: "120px",
              backgroundColor: status === "Completed" ? "#f8f9fa" : "white"
            }}
            disabled={status === "Completed"}
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
        {status === "Pending" ? (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-success d-flex align-items-center gap-1"
              onClick={onAccept}
              title="Accept Order"
            >
              <Check size={14} />
              Accept
            </button>
            <button 
              className="btn btn-sm btn-danger d-flex align-items-center gap-1"
              onClick={onReject}
              title="Reject Order"
            >
              <X size={14} />
              Reject
            </button>
          </div>
        ) : status === "Rejected" ? (
          <span className="text-muted small">Order Rejected</span>
        ) : status === "Completed" ? (
          <span className="text-success small fw-medium">✓ Completed</span>
        ) : (
          <span className="text-info small">In Progress</span>
        )}
      </td>
    </tr>
  );
};
