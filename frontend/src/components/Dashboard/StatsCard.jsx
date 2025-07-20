export const StatsCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="card p-3 border rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="text-muted mb-0">{title}</h6>
        {icon}
      </div>
      <h3 className="fw-bold">{value}</h3>
      {subtitle && <small className="text-muted">{subtitle}</small>}
    </div>
  );
};