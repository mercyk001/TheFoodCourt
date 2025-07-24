
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import TableBooking from './pages/TableBooking';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OutletDashboard from './pages/OutletDashboard';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
  const [cartItems, setCartItems] = useState([]);
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  const handleAddToCart = (meal) => {
    const existing = cartItems.find(item => item.id === meal.id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.id === meal.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([
        ...cartItems,
        {
          id: meal.id,
          name: meal.name,
          quantity: 1,
          price: meal.price,
          restaurant: meal.restaurant,
          image: meal.image || '/placeholder.jpg',
        },
      ]);
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
    <Router>
      <Routes>
        <Route
          element={
            <Layout cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu onAddToCart={handleAddToCart} />} />
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
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
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
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
