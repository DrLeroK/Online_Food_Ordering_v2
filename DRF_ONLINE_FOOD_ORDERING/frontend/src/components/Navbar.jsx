import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { jwtDecode } from "jwt-decode";
import { FaUser, FaShoppingCart, FaHistory, FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import api from '../api';

const Navbar = ({ isAuthenticated, setIsAuthenticated, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Get username from token if authenticated
  const username = isAuthenticated 
    ? jwtDecode(localStorage.getItem(ACCESS_TOKEN)).username 
    : '';

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken });
      }

      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsMobileMenuOpen(false);
      setIsProfileMenuOpen(false);
      
      window.location.href = '/';
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const getActiveLink = (path) => {
    return location.pathname === path ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700 hover:text-red-600';
  };

  const handleProfileButtonClick = (e) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Mobile menu link click handler
  const handleMobileLinkClick = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(false);
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
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium ${getActiveLink('/contact')}`}
              >
                Contact
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
                    className="relative p-2 text-gray-700 hover:text-red-600 group"
                  >
                    <FaShoppingCart className="h-6 w-6" />
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                      Your Cart
                    </span>
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
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <FaUser className="inline mr-2" />
                          Profile
                        </Link>
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

          {/* Mobile menu button and cart icon */}
          <div className="md:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-red-600"
              >
                <FaShoppingCart className="h-6 w-6" />
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                  Cart
                </span>
              </Link>
            )}
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
      <div 
        ref={mobileMenuRef}
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={handleMobileLinkClick}
          >
            Home
          </Link>
          <Link
            to="/menu/items"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname.startsWith('/menu') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={handleMobileLinkClick}
          >
            Menu
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/about' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={handleMobileLinkClick}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/contact' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
            onClick={handleMobileLinkClick}
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/profile' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                onClick={handleMobileLinkClick}
              >
                Profile
              </Link>
              <Link
                to="/order-history"
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/order-history' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                onClick={handleMobileLinkClick}
              >
                Order History
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname.startsWith('/admin') ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                  onClick={handleMobileLinkClick}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={(e) => {
                  handleMobileLinkClick(e);
                  handleLogout();
                }}
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
                onClick={handleMobileLinkClick}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                onClick={handleMobileLinkClick}
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
