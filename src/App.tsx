// App.tsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './AppRoutes';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// ALWAYS USE PAYPAL - (stripe sucks and you have to be 18+)
const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "subscription",
  vault: true,
};

function App() {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </PayPalScriptProvider>
  );
}

export default App;