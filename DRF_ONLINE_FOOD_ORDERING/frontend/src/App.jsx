import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "./constants";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import ItemCreate from "./pages/items/ItemCreate";
import ItemEdit from "./pages/items/ItemEdit";
import ItemList from "./pages/items/ItemList";
import ItemDetail from "./pages/items/ItemDetail";
import CartPage from "./pages/cart/CartPage";
import OrderHistoryPage from "./pages/orders/OrderHistoryPage";
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminItems from './pages/admin/AdminItems';
// import AdminSales from './pages/admin/AdminSales';    
import AdminTopItems from './pages/admin/AdminTopItems';

import SalesAnalytics from './pages/admin/SalesAnalytics'; // Import the new component

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setIsAuthenticated(true);
          setIsAdmin(decoded.is_admin || false);
        } catch (error) {
          console.error("Token invalid, clearing:", error);
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    verifyAuth();
  }, []);


  return (
    <BrowserRouter>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Navbar 
        isAuthenticated={isAuthenticated} 
        isAdmin={isAdmin}
        setIsAuthenticated={setIsAuthenticated} 
      />

      <main className="min-h-screen">
        <Routes>

          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin}  />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/menu/items" element={<ItemList />} />
          <Route path="/menu/items/:slug" element={<ItemDetail />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset-confirm/:uid/:token" element={<ResetPasswordConfirm />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}>
            <Route path="/items/create" element={<ItemCreate />} />
            <Route path="/menu/items/:slug/edit" element={<ItemEdit />} />
            <Route path="admin" element={<AdminDashboard />}>
              <Route index element={<AdminDashboardPage />} /> 
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="items" element={<AdminItems />} />
              {/* <Route path="sales" element={<AdminSales />} /> */}
              <Route path="top-items" element={<AdminTopItems />} />

              {/* New sales analytics route */}
              <Route path="sales-analytics" element={<SalesAnalytics />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>

      <Footer />

    </BrowserRouter>
  );
}

export default App;