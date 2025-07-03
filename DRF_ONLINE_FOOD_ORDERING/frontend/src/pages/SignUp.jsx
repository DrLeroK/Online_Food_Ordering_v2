import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { validateEmail, validatePassword, formatPhoneNumber, validateUsername } from '../utils/validation';



const SignUp = () => {

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();


  // Validate form on change
  useEffect(() => {
    const validateForm = () => {
      const isUsernameValid = validateUsername(formData.username);
      const isEmailValid = validateEmail(formData.email);
      const isPhoneValid = formData.phone_number.replace(/\D/g, '').length >= 10;
      const isFirstNameValid = formData.first_name.trim().length > 0;
      const isLastNameValid = formData.last_name.trim().length > 0;
      const isPasswordValid = passwordValidation?.isValid;
      const doPasswordsMatch = formData.password === formData.password2 && formData.password.length > 0;

      return (
        isUsernameValid &&
        isEmailValid &&
        isPhoneValid &&
        isFirstNameValid &&
        isLastNameValid &&
        isPasswordValid &&
        doPasswordsMatch
      );
    };

    setIsFormValid(validateForm());
  }, [formData, passwordValidation]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number formatting
    if (name === 'phone_number') {
      setFormData({
        ...formData,
        [name]: formatPhoneNumber(value),
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate password in real-time
    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setErrors({});

    try {
      await api.post('/user_management/register/', {
        ...formData,
        phone_number: formData.phone_number.replace(/\D/g, '') // Remove formatting before sending
      });
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      {loading && <LoadingIndicator />}
      
      <div className="w-full max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            Join our burger community today
          </p>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-6">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-6 shadow-lg rounded-lg">
          {errors.non_field_errors && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-xs sm:text-sm">
              {errors.non_field_errors.join(' ')}
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="block w-full pr-3 pl-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="block w-full pr-3 pl-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

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
                    className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                {errors.username ? (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.username}</p>
                ) : formData.username && !validateUsername(formData.username) && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">
                    Username must be at least 3 characters and contain only letters, numbers, and underscores.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                    placeholder="example@gmail.com"
                  />
                </div>
                {errors.email ? (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
                ) : formData.email && !validateEmail(formData.email) && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">Please enter a valid email address.</p>
                )}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                    placeholder="091-234-5678"
                    maxLength={12}
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phone_number}</p>
                )}
                {formData.phone_number && formData.phone_number.replace(/\D/g, '').length < 10 && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">Phone number must be at least 10 digits.</p>
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
                    className="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
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
                {errors.password ? (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>
                ) : (
                  formData.password && (
                    <div className="mt-2 text-xs sm:text-sm">
                      <div className={`flex items-center ${passwordValidation?.requirements.length ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation?.requirements.length ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center ${passwordValidation?.requirements.number ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation?.requirements.number ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                        Contains a number
                      </div>
                      <div className={`flex items-center ${passwordValidation?.requirements.specialChar ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation?.requirements.specialChar ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                        Contains a special character
                      </div>
                    </div>
                  )
                )}
              </div>

              <div>
                <label htmlFor="password2" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password2"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <FaEye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password2 ? (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password2}</p>
                ) : formData.password2 && formData.password !== formData.password2 && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">Passwords do not match.</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${
                  !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Sign Up
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;






// UPDATED PAGE NEED TO BE INSERTED TO THE MAIN ONE


