import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Restaurants from './pages/Restaurant';
import TableBooking from './pages/TableBooking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant" element={<Restaurants />} />
        <Route path="/tablebooking" element={<TableBooking />} />
      </Routes>
    </Router>
  );
}

export default App;
