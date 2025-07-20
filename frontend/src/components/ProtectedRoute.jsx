import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // You can adjust this logic depending on your auth flow
  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
