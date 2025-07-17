import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Restaurants from './pages/Restaurant';
import Menu from './pages/Menu';
import TableBooking from './pages/TableBooking';
import Cart from './pages/Cart';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
         <Route path="/" element={<Home />} />
         <Route path="/restaurant" element={<Restaurants />} />
         <Route path="/menu/:id" element={<Menu />} />

        <Route path="/tablebooking" element={<TableBooking />} />
        <Route path="/cart" element={<Cart />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
