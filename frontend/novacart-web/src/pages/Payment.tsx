import React from 'react';
import { Navigate } from 'react-router-dom';

export const PaymentPage: React.FC = () => {
  // Payment is handled directly inside Checkout and OrderTracking pages via RazorpayWidget.
  // Redirecting to orders.
  return <Navigate to="/orders" replace />;
};
