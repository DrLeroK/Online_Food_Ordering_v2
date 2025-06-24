import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { jwtDecode } from "jwt-decode";
import { FaUser, FaShoppingCart, FaHistory, FaBars, FaTimes } from 'react-icons/fa';
import api from '../api';

const Navbar = ({ isAuthenticated, setIsAuthenticated, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const profileMenuRef = useRef(null);
  
  // Get username from token if authenticated
  const username = isAuthenticated 
    ? jwtDecode(localStorage.getItem(ACCESS_TOKEN)).username 
    : '';


    const handleLogout = async () => {
      try {
        // 1. Get refresh token from storage (you'll need to store this during login)
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        
        // 2. Call backend logout endpoint
        if (refreshToken) {
          await api.post('/logout/', { refresh: refreshToken });
        }

        // 3. Clear all client-side storage
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        
        // 4. Reset all state
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        setCartCount(0);
        
        // 5. Redirect (force full page reload for security)
        window.location.href = '/'; // Full reload clears memory

      } catch (err) {
        console.error("Logout error:", err);
        // Still clear local state even if backend logout failed
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = '/';
      }
    };

  // const handleLogout = () => {
  //   localStorage.removeItem(ACCESS_TOKEN);
  //   setIsAuthenticated(false);
  //   setIsMobileMenuOpen(false);
  //   setIsProfileMenuOpen(false);
  //   setCartCount(0); // Reset cart count on logout
  //   navigate('/');
  // };

  // Fetch cart items count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCartCount = async () => {
        try {
          const response = await api.get('/cart/');
          const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } catch (err) {
          console.error('Error fetching cart items:', err);
        }
      };
      
      fetchCartCount();
      
      // Set up polling to keep cart count updated (every 30 seconds)
      const intervalId = setInterval(fetchCartCount, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, location]); // Re-run when auth status or location changes

  // Close menus when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Determine active link based on current path
  const getActiveLink = (path) => {
    return location.pathname === path ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:text-red-600';
  };

  const handleProfileButtonClick = (e) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold">
                <span className="text-red-600">Atlas</span>
                <span className="text-gray-800">Burgers</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-6">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${getActiveLink('/')}`}
              >
                Home
              </Link>
              <Link
                to="/menu/items"
                className={`px-3 py-2 rounded-md text-sm font-medium ${getActiveLink('/menu/items')}`}
              >
                Menu
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium ${getActiveLink('/about')}`}
              >
                About
              </Link>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-red-600"
                  >
                    <FaShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                  
                  <div className="relative" ref={profileMenuRef}>
                    <button 
                      className="flex items-center space-x-1 focus:outline-none"
                      onClick={handleProfileButtonClick}
                    >
                      <FaUser className="h-5 w-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">{username}</span>
                    </button>
                    
                    {isProfileMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                      >
                        <Link
                          to="/order-history"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <FaHistory className="inline mr-2" />
                          Order History
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium ${getActiveLink('/login')}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 focus:outline-none mobile-menu-button"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/menu/items"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname.startsWith('/menu') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Menu
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/about' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/cart' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link
                to="/order-history"
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/order-history' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Order History
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname.startsWith('/admin') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
              <div className="px-3 py-2 text-sm text-gray-500">
                Logged in as: {username}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/login' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;