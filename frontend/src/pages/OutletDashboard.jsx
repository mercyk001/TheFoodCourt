import { useState, useEffect } from "react";
import { StatsCard } from "../components/Dashboard/StatsCard";
import { OrdersTable } from "../components/Dashboard/OrderTable";
import { BookingsTable } from "../components/Dashboard/BookingsTable";
import { OutletsTable } from "../components/Dashboard/OutletsTable";
import { MenuItemsTable } from "../components/Dashboard/MenuItemsTable";
import { DollarSign, Package, Store, Calendar } from "lucide-react";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function OutletDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [orderFilter, setOrderFilter] = useState("today"); // Add order filter state
  const [dashboardStats, setDashboardStats] = useState({
    todaysOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeOutlets: 0,
    totalOutlets: 0,
    tableBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user:', user);
    if (user) {
      console.log('User role:', user.role);
      console.log('User userType:', user.userType);
    }
    if (user && user.role === 'owner') {
      console.log('Loading dashboard stats for owner...');
      loadDashboardStats();
    } else {
      console.log('User is not an owner or user is null');
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard stats...');
      const response = await apiService.getDashboardStats();
      console.log('Dashboard stats response:', response);
      
      // Handle the response data more carefully
      let statsData = response;
      if (response.data) {
        statsData = response.data;
      }
      
      console.log('Stats data after processing:', statsData);
      
      // The response should now be the combined data object directly
      const stats = {
        todaysOrders: statsData.todaysOrders || 0,
        pendingOrders: statsData.pendingOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        activeOutlets: statsData.activeOutlets || 0,
        totalOutlets: statsData.totalOutlets || 0,
        tableBookings: statsData.tableBookings || 0
      };
      
      console.log('Final processed stats:', stats);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Keep default values if error occurs
      setDashboardStats({
        todaysOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        activeOutlets: 0,
        totalOutlets: 0,
        tableBookings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Refresh stats when switching tabs to keep data current
    if (user && user.role === 'owner') {
      loadDashboardStats();
    }
  };
  return (
    <div className="container py-5 ">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Outlet Dashboard</h2>
          <p className="text-muted mb-0">Manage your orders, bookings, and menu items</p>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={loadDashboardStats}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>
      </div>

      <div className="row g-3 my-4">
        <div className="col-md-6 col-lg-3">
          <StatsCard 
            title="Today's Orders" 
            value={loading ? "..." : (dashboardStats.todaysOrders || 0)} 
            subtitle={loading ? "Loading..." : `${dashboardStats.pendingOrders || 0} pending`} 
            icon={<Package size={20} />} 
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatsCard 
            title="Total Revenue" 
            value={loading ? "..." : `KES ${Number(dashboardStats.totalRevenue || 0).toLocaleString()}`} 
            subtitle="From completed orders" 
            icon={<DollarSign size={20} />} 
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatsCard 
            title="Active Outlets" 
            value={loading ? "..." : (dashboardStats.activeOutlets || 0)} 
            subtitle={loading ? "Loading..." : `Out of ${dashboardStats.totalOutlets || 0} total`} 
            icon={<Store size={20} />} 
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatsCard 
            title="Table Bookings" 
            value={loading ? "..." : (dashboardStats.tableBookings || 0)} 
            subtitle="Total reservations" 
            icon={<Calendar size={20} />} 
          />
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
          onClick={() => handleTabChange("orders")}
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
          onClick={() => handleTabChange("bookings")}
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
            borderLeft: activeTab === "outlets" ? "1px solid #dee2e6" : "none",
            borderRight: activeTab === "outlets" ? "1px solid #dee2e6" : "none",
            padding: "12px 16px",
            fontWeight: activeTab === "outlets" ? "600" : "500"
          }}
          onClick={() => handleTabChange("outlets")}
          type="button" 
          role="tab"
        >
          Outlets
        </button>
        <button 
          className={`flex-fill btn ${activeTab === "menu-items" ? "btn-light" : ""}`}
          style={{
            backgroundColor: activeTab === "menu-items" ? "white" : "#FFF8F0",
            border: "1px solid #dee2e6",
            borderRadius: "0",
            borderTopRightRadius: "0.375rem",
            borderLeft: activeTab === "menu-items" ? "1px solid #dee2e6" : "none",
            padding: "12px 16px",
            fontWeight: activeTab === "menu-items" ? "600" : "500"
          }}
          onClick={() => handleTabChange("menu-items")}
          type="button" 
          role="tab"
        >
          Menu Items
        </button>
      </div>
      <div className="tab-content pt-3" id="dashboardTabsContent">
        {activeTab === "orders" && (
          <div className="p-3" style={{ backgroundColor: "white", border: "0px solid #dee2e6", borderTop: "none", borderRadius: "0 0 0.375rem 0.375rem" }}>
            {/* Orders Filter */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Orders Management</h5>
              <div className="btn-group" role="group" aria-label="Order filters">
                <button 
                  type="button" 
                  className={`btn btn-sm ${orderFilter === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setOrderFilter('today')}
                >
                  Today's Orders
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${orderFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setOrderFilter('all')}
                >
                  All Orders
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${orderFilter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setOrderFilter('pending')}
                >
                  Pending Only
                </button>
              </div>
            </div>
            <OrdersTable filter={orderFilter} />
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
        {activeTab === "menu-items" && (
          <div className="p-3" style={{ backgroundColor: "white", border: "0px solid #dee2e6", borderTop: "none", borderRadius: "0 0 0.375rem 0.375rem" }}>
            <MenuItemsTable />
          </div>
        )}
      </div>
    </div>
  );
}

