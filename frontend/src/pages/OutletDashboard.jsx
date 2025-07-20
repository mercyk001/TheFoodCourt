import { useState } from "react";
import { StatsCard } from "../components/Dashboard/StatsCard";
import { OrdersTable } from "../components/Dashboard/OrderTable";
import { BookingsTable } from "../components/Dashboard/BookingsTable";
import { OutletsTable } from "../components/Dashboard/OutletsTable";
import { DollarSign, Package, Store, Calendar } from "lucide-react";

export default function OutletDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  return (
    <div className="container py-5 ">
      <h2 className="fw-bold">Outlet Dashboard</h2>
      <p className="text-muted">Manage your orders, bookings, and menu items</p>

      <div className="row g-3 my-4">
        <div className="col-md-6 col-lg-3">
          <StatsCard title="Today's Orders" value={2} subtitle="1 pending" icon={<Package size={20} />} />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatsCard title="Total Revenue" value="$17.82" subtitle="From completed orders" icon={<DollarSign size={20} />} />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatsCard title="Active Outlets" value={4} subtitle="Out of 4 total" icon={<Store size={20} />} />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatsCard title="Table Bookings" value={1} subtitle="Total reservations" icon={<Calendar size={20} />} />
        </div>
      </div>

      <div className="d-flex w-100 mb-3 h-30">
        <button 
          className={`flex-fill btn ${activeTab === "orders" ? "btn-light" : ""}`}
          style={{
            backgroundColor: activeTab === "orders" ? "white" : "#FFF8F0",
            border: "1px solid #dee2e6",
            borderRadius: "0",
            borderTopLeftRadius: "0.375rem",
            borderRight: activeTab === "orders" ? "1px solid #dee2e6" : "none",
            padding: "12px 16px",
            fontWeight: activeTab === "orders" ? "600" : "500"
          }}
          onClick={() => setActiveTab("orders")}
          type="button" 
          role="tab"
        >
          Orders
        </button>
        <button 
          className={`flex-fill btn ${activeTab === "bookings" ? "btn-light" : ""}`}
          style={{
            backgroundColor: activeTab === "bookings" ? "white" : "#FFF8F0",
            border: "1px solid #dee2e6",
            borderRadius: "0",
            borderLeft: activeTab === "bookings" ? "1px solid #dee2e6" : "none",
            borderRight: activeTab === "bookings" ? "1px solid #dee2e6" : "none",
            padding: "12px 16px",
            fontWeight: activeTab === "bookings" ? "600" : "500"
          }}
          onClick={() => setActiveTab("bookings")}
          type="button" 
          role="tab"
        >
          Bookings
        </button>
        <button 
          className={`flex-fill btn ${activeTab === "outlets" ? "btn-light" : ""}`}
          style={{
            backgroundColor: activeTab === "outlets" ? "white" : "#FFF8F0",
            border: "1px solid #dee2e6",
            borderRadius: "0",
            borderTopRightRadius: "0.375rem",
            borderLeft: activeTab === "outlets" ? "1px solid #dee2e6" : "none",
            padding: "12px 16px",
            fontWeight: activeTab === "outlets" ? "600" : "500"
          }}
          onClick={() => setActiveTab("outlets")}
          type="button" 
          role="tab"
        >
          Outlets
        </button>
      </div>
      <div className="tab-content pt-3" id="dashboardTabsContent">
        {activeTab === "orders" && (
          <div className="p-3" style={{ backgroundColor: "white", border: "0px solid #dee2e6", borderTop: "none", borderRadius: "0 0 0.375rem 0.375rem" }}>
            <OrdersTable />
          </div>
        )}
        {activeTab === "bookings" && (
          <div className="p-3" style={{ backgroundColor: "white", border: "0px solid #dee2e6", borderTop: "none", borderRadius: "0 0 0.375rem 0.375rem" }}>
            <BookingsTable />
          </div>
        )}
        {activeTab === "outlets" && (
          <div className="p-3" style={{ backgroundColor: "white", border: "0px solid #dee2e6", borderTop: "none", borderRadius: "0 0 0.375rem 0.375rem" }}>
            <OutletsTable />
          </div>
        )}
      </div>
    </div>
  );
}

