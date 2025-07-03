import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUser, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import LoadingIndicator from '../components/LoadingIndicator';

const Login = ({ setIsAuthenticated, setIsAdmin }) => {
  const MIN_USERNAME_LENGTH = 3;
  const MIN_PASSWORD_LENGTH = 8;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isFormValid = 
    formData.username.trim().length >= MIN_USERNAME_LENGTH && 
    formData.password.length >= MIN_PASSWORD_LENGTH;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    if (name === 'username') {
      // Remove special characters from username (keep letters, numbers, underscores)
      sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, '');
    }
    
    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation before API call
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.username.trim().length < MIN_USERNAME_LENGTH) {
      setError(`Username must be at least ${MIN_USERNAME_LENGTH} characters`);
      return;
    }

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/token/', formData);
      
      if (response.data.access && response.data.refresh) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        
        const decoded = jwtDecode(response.data.access);
        setIsAuthenticated(true);
        setIsAdmin(decoded.is_admin || false);
        navigate('/');
      } else {
        throw new Error("Missing tokens in response");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      {loading && <LoadingIndicator />}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors duration-200 text-sm sm:text-base"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Login to Your Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Welcome back to our burger community
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                  required
                  minLength={MIN_USERNAME_LENGTH}
                />
              </div>
              {formData.username.length > 0 && formData.username.length < MIN_USERNAME_LENGTH && (
                <p className="mt-1 text-xs text-red-600">
                  Username must be at least {MIN_USERNAME_LENGTH} characters
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <FaEye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formData.password.length > 0 && formData.password.length < MIN_PASSWORD_LENGTH && (
                <p className="mt-1 text-xs text-red-600">
                  Password must be at least {MIN_PASSWORD_LENGTH} characters
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-xs sm:text-sm">
                <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${
                  !isFormValid ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


// UPDATED PAGE NEED TO BE INSERTED TO THE MAIN ONE