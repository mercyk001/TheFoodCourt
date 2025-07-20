import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Restaurants from './pages/Restaurant';
import Menu from './pages/Menu';
import TableBooking from './pages/TableBooking';
import Cart from './pages/Cart';
import OutletDashboard from './pages/OutletDashboard';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (mealName) => {
    const existing = cartItems.find(item => item.name === mealName);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.name === mealName ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: Date.now(),
        name: mealName,
        qty: 1,
        price: 300, 
        restaurant: 'Unknown',
        image: '/placeholder.jpg'
      }]);
    }
  };

  const handleRemoveFromCart = (item) => {
    const updated = cartItems
      .map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty - 1 } : cartItem
      )
      .filter(cartItem => cartItem.qty > 0);
    setCartItems(updated);
  };

  const handleClearCart = () => setCartItems([]);
  const handlePlaceOrder = () => {
    alert('Order placed!');
    setCartItems([]);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            element={
              <Layout cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)} />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/restaurant" element={<Restaurants />} />
            <Route
              path="/menu/:id"
              element={<Menu onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  onAdd={handleAddToCart}
                  onRemove={handleRemoveFromCart}
                  onClear={handleClearCart}
                  onPlaceOrder={handlePlaceOrder}
                />
              }
            />
            <Route path="/tablebooking" element={<TableBooking />} />
            <Route
              path="/outlet-dashboard"
              element={
                <ProtectedRoute>
                  <OutletDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
