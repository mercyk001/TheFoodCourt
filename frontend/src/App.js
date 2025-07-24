
import React, { useState, useEffect } from 'react';
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

// Cart persistence utilities
const CART_STORAGE_KEY = 'foodcourt_cart';
const CART_EXPIRY_HOURS = 24; // Cart expires after 24 hours

const getCartStorageKey = (userId = null) => {
  // Use user-specific key when logged in, fallback to general key for guests
  return userId ? `${CART_STORAGE_KEY}_user_${userId}` : CART_STORAGE_KEY;
};

const saveCartToStorage = (cartItems, userId = null) => {
  try {
    const cartData = {
      items: cartItems,
      timestamp: Date.now(),
      expiresAt: Date.now() + (CART_EXPIRY_HOURS * 60 * 60 * 1000),
      userId: userId
    };
    const storageKey = getCartStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(cartData));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = (userId = null) => {
  try {
    const storageKey = getCartStorageKey(userId);
    const savedCart = localStorage.getItem(storageKey);
    if (!savedCart) return [];

    const cartData = JSON.parse(savedCart);
    
    // Check if cart has expired
    if (Date.now() > cartData.expiresAt) {
      localStorage.removeItem(storageKey);
      console.log('Cart expired and was cleared');
      return [];
    }

    // Verify cart belongs to current user (if userId is provided)
    if (userId && cartData.userId && cartData.userId !== userId) {
      console.log('Cart belongs to different user, clearing');
      localStorage.removeItem(storageKey);
      return [];
    }

    return cartData.items || [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

const clearCartFromStorage = (userId = null) => {
  try {
    const storageKey = getCartStorageKey(userId);
    localStorage.removeItem(storageKey);
    
    // Also clear the general key if user-specific key was used
    if (userId) {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
};

function AppContent() {
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState([]);
  const { loading, user } = useAuth();

  // Load cart when user state changes (login/logout)
  useEffect(() => {
    const userId = user?.id;
    const loadedCart = loadCartFromStorage(userId);
    setCartItems(loadedCart);
  }, [user]);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    const userId = user?.id;
    saveCartToStorage(cartItems, userId);
  }, [cartItems, user?.id]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      // User logged out, clear cart for security/privacy
      console.log(`Clearing cart with ${cartItems.length} items due to user logout`);
      setCartItems([]);
      clearCartFromStorage(); // Clear both general and any user-specific carts
    }
  }, [user, cartItems.length]);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleAddToCart = (meal) => {
    const existing = cartItems.find(item => item.id === meal.id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.id === meal.id
          ? { ...item, quantity: item.quantity + 1, updatedAt: Date.now() }
          : item
      ));
    } else {
      setCartItems([
        ...cartItems,
        {
          id: meal.id,
          meal_id: meal.meal_id, // Include meal_id for backend compatibility
          name: meal.name,
          quantity: 1,
          price: meal.price,
          description: meal.description,
          restaurant: meal.restaurant,
          restaurant_id: meal.restaurant_id, // Include restaurant_id
          image: meal.image || '/placeholder.jpg',
          addedAt: Date.now(), // Track when item was added
          updatedAt: Date.now() // Track last update
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id, newQty) => {
    setCartItems(prev =>
      newQty > 0
        ? prev.map(item => item.id === id ? { ...item, quantity: newQty, updatedAt: Date.now() } : item)
        : prev.filter(item => item.id !== id)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    const userId = user?.id;
    clearCartFromStorage(userId);
  };

  const handleCartUpdate = (newCartItems) => {
    setCartItems(newCartItems);
  };

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
                onCartUpdate={handleCartUpdate}
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
