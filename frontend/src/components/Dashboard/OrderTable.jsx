import { useState } from "react";
import { OrderRow } from "./OrderRow";

const initialOrders = [
  {
    id: 1,
    orderId: "#1752950140911",
    customer: "Shawn otieno Otieno",
    phone: "0712345678",
    items: "1x Jollof Rice with Grilled Chicken",
    total: "$17.82",
    status: "Delivered",
  },
  {
    id: 2,
    orderId: "#1752950493277",
    customer: "Shawn otieno Otieno",
    phone: "+254111205871",
    table: "Table 2",
    items: "1x Jollof Rice with Grilled Chicken, 1x Cassava Fufu with Fish Stew",
    total: "$39.41",
    status: "Pending",
  },
  {
    id: 3,
    orderId: "#1752950493278",
    customer: "mwaura cleanshelf",
    phone: "+254722123456",
    table: "Table 5",
    items: "2x Ugali with Beef Stew, 1x Chapati",
    total: "$25.60",
    status: "Pending",
  }
];

export const OrdersTable = () => {
  const [orders, setOrders] = useState(initialOrders);

  const handleAcceptOrder = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: "Accepted" }
        : order
    ));
  };

  const handleRejectOrder = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: "Rejected" }
        : order
    ));
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };
  return (
    <div className="card p-4 shadow-sm">
      <h5 className="mb-3">Recent Orders</h5>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead style={{ backgroundColor: "#FFFBF7" }}>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow 
                key={order.id} 
                {...order} 
                onAccept={() => handleAcceptOrder(order.id)}
                onReject={() => handleRejectOrder(order.id)}
                onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
