import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import Restaurants from './pages/Restaurant';
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
        item.name === mealName ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: Date.now(),
        name: mealName,
        quantity: 1,
        price: 300,
        restaurant: 'Unknown',
        image: '/placeholder.jpg'
      }]);
    }
  };

  const handleUpdateQuantity = (id, newQty) => {
    setCartItems(prev =>
      newQty > 0
        ? prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)
        : prev.filter(item => item.id !== id)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => setCartItems([]);

  const getTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <AuthProvider>
      <Router>
        <Routes>
<<<<<<< Updated upstream
          <Route
            element={
              <Layout cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/restaurant" element={<Restaurants />} />
            <Route path="/menu/:id" element={<Menu onAddToCart={handleAddToCart} />} />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  updateQuantity={handleUpdateQuantity}
                  removeItem={handleRemoveItem}
                  clearCart={handleClearCart}
                  getTotal={getTotal}
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
=======
          <Route element={<Layout />}>
           <Route path="/" element={<Home />} />
           {/* <Route path="/restaurant" element={<Restaurants />} /> */}
           <Route path="/menu" element={<Menu />} />
           <Route path="/tablebooking" element={<TableBooking />} />
           <Route path="/cart" element={<Cart />} />
           <Route path="/outlet-dashboard" element={
             <ProtectedRoute>
               <OutletDashboard />
             </ProtectedRoute>
           } />
>>>>>>> Stashed changes
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
