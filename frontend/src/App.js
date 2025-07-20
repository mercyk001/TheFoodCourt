import React from 'react';
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
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
           <Route path="/" element={<Home />} />
           <Route path="/restaurant" element={<Restaurants />} />
           <Route path="/menu/:id" element={<Menu />} />
           <Route path="/tablebooking" element={<TableBooking />} />
           <Route path="/cart" element={<Cart />} />
           <Route path="/outlet-dashboard" element={
             <ProtectedRoute>
               <OutletDashboard />
             </ProtectedRoute>
           } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
