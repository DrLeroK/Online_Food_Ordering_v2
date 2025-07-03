import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaArrowLeft, FaTrash, FaPlus, FaMinus, FaShoppingBasket } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [pickupBranch, setPickupBranch] = useState('atlas1');
  const [deliveryTime, setDeliveryTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [pickupTime, setPickupTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const navigate = useNavigate();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const pickupLocations = {
    atlas1: { 
      name: 'ATLAS CAFE - Main Branch', 
      address: "Central Ambo, Near Commercial Bank"
    },
    atlas2: { 
      name: 'ATLAS CAFE - Downtown', 
      address: "Downtown Ambo, Near Municipality"
    }
  };

  // Sanitize and validate delivery address

  const sanitizeAddress = (input) => {
    if (!input) return '';
    
    // Remove potentially dangerous characters but preserve spaces
    let sanitized = input
      .replace(/[<>"'`;\\/]/g, '') // Basic XSS protection
      .replace(/\b(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|SELECT|UPDATE|UNION|WHERE)\b/gi, '') // Basic SQLi protection
      .trim(); // Only trim whitespace from ends

    // Advanced sanitization with DOMPurify
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [] // No attributes allowed
    });

    return sanitized.substring(0, 500); // Enforce max length
  };

  // Updated handleAddressChange to fix space issue
  const handleAddressChange = (e) => {
    const rawValue = e.target.value;
    setDeliveryAddress(rawValue); // First update with raw value for responsive typing
    
    // Then validate the sanitized version
    const sanitizedValue = sanitizeAddress(rawValue);
    setAddressError(validateAddress(sanitizedValue));
  };

  // const sanitizeAddress = (input) => {
  //   // Remove potentially dangerous characters and trim whitespace
  //   let sanitized = input
  //     .replace(/[<>"'`;\\/]/g, '') // Basic XSS protection
  //     .replace(/\b(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|SELECT|UPDATE|UNION|WHERE)\b/gi, '') // Basic SQLi protection
  //     .trim();

  //   // Advanced sanitization with DOMPurify
  //   sanitized = DOMPurify.sanitize(sanitized, {
  //     ALLOWED_TAGS: [], // No HTML tags allowed
  //     ALLOWED_ATTR: [] // No attributes allowed
  //   });

  //   return sanitized.substring(0, 500); // Enforce max length
  // };

  const validateAddress = (address) => {
    if (!address) {
      return 'Delivery address is required';
    }
    if (address.length < 10) {
      return 'Address is too short (minimum 10 characters)';
    }
    if (address.length > 500) {
      return 'Address is too long (maximum 500 characters)';
    }
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(address)) {
      return 'Only letters, numbers, spaces, and basic punctuation allowed';
    }
    return '';
  };

  // const handleAddressChange = (e) => {
  //   const rawValue = e.target.value;
  //   const sanitizedValue = sanitizeAddress(rawValue);
  //   setDeliveryAddress(sanitizedValue);
  //   setAddressError(validateAddress(sanitizedValue));
  // };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await api.get('/cart/');
        setCartItems(response.data);
      } catch (err) {
        setError('Failed to load cart items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1 || newQuantity > 100) return; // Prevent unrealistic quantities
      
      const response = await api.patch(`/cart/items/${itemId}/`, {
        quantity: newQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? response.data : item
      ));
    } catch (err) {
      setError('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}/remove/`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to remove item. Please try again.');
    }
  };

  const clearCart = async () => {
    try {
      await api.post('/cart/clear/');
      setCartItems([]);
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
    }
  };

  const initiatePayment = async (amount) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const response = await api.post('/payments/initiate/', { amount });
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setPaymentError('Failed to get payment link.');
      }
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Payment initiation failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const placeOrder = async () => {
    setOrderLoading(true);
    setError('');
    
    try {
      // Final validation before submission
      if (deliveryOption === 'delivery') {
        const addressValidationError = validateAddress(deliveryAddress);
        if (addressValidationError) {
          setAddressError(addressValidationError);
          setOrderLoading(false);
          return;
        }
      }

      const orderData = {
        delivery_option: deliveryOption,
        delivery_time: deliveryOption === 'delivery' ? deliveryTime : null,
        pickup_time: deliveryOption === 'pickup' ? pickupTime : null,
        pickup_branch: deliveryOption === 'pickup' ? pickupBranch : null,
        delivery_address: deliveryOption === 'delivery' ? deliveryAddress : null,
      };
      // Place order first (optional: you may want to do this after payment success)
      await api.post('/orders/', orderData);
      // Initiate payment for the total amount
      await initiatePayment(calculateGrandTotal());
      // setCartItems([]); // Only clear cart after payment success
      // navigate('/order-history');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to place order. Please try again.';
      setError(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.quantity * item.item.price);
    }, 0).toFixed(2);
  };

  const calculateGrandTotal = () => {
    const subtotal = parseFloat(calculateTotal());
    const deliveryFee = deliveryOption === 'delivery' ? 29.99 : 0;
    return (subtotal + deliveryFee).toFixed(2);
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="text-red-500 text-center mt-8 p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 p-2 -ml-2"
          aria-label="Go back"
        >
          <FaArrowLeft className="mr-2" />
          <span className="sr-only sm:not-sr-only">Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex-1">
          Your <span className="text-red-600">Cart</span>
        </h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <FaShoppingBasket className="text-gray-200 text-5xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
          <button 
            onClick={() => navigate('/menu/items/')}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Browse Our Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {cartItems.map(item => (
              <div key={item.id} className="border-b border-gray-100 last:border-0 p-4 sm:p-6">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4 sm:mr-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.item.image} 
                        alt={item.item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/default-food.png';
                        }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">
                        {item.item.title}
                      </h3>
                      <p className="text-red-600 font-medium text-sm sm:text-base">
                        ETB {parseFloat(item.item.price).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mr-2 sm:mr-4">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                        <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-x border-gray-200 font-medium text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 sm:p-2 transition-colors duration-200"
                        aria-label="Remove item"
                      >
                        <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Delivery Options
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {/* Pickup Option */}
              <div className="flex items-start">
                <input
                  type="radio"
                  id="pickup"
                  name="deliveryOption"
                  value="pickup"
                  checked={deliveryOption === 'pickup'}
                  onChange={() => setDeliveryOption('pickup')}
                  className="mt-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <label htmlFor="pickup" className="block text-base sm:text-lg font-medium text-gray-900">
                    Pickup from Restaurant
                  </label>
                  {deliveryOption === 'pickup' && (
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Pickup Branch
                        </label>
                        <select
                          value={pickupBranch}
                          onChange={(e) => setPickupBranch(e.target.value)}
                          className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="atlas1">ATLAS CAFE - Main Branch</option>
                          <option value="atlas2">ATLAS CAFE - Downtown</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Pickup Time
                        </label>
                        <input
                          type="datetime-local"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Delivery Option */}
              <div className="flex items-start">
                <input
                  type="radio"
                  id="delivery"
                  name="deliveryOption"
                  value="delivery"
                  checked={deliveryOption === 'delivery'}
                  onChange={() => setDeliveryOption('delivery')}
                  className="mt-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <label htmlFor="delivery" className="block text-base sm:text-lg font-medium text-gray-900">
                    Delivery to Address
                  </label>
                  {deliveryOption === 'delivery' && (
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Delivery Time
                        </label>
                        <input
                          type="datetime-local"
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Delivery Address
                        </label>
                        <textarea
                          value={deliveryAddress}
                          onChange={handleAddressChange}
                          placeholder="Enter your full address (street, building, floor, etc.)"
                          className={`w-full p-2 sm:p-3 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                            addressError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          rows={3}
                          maxLength={500}
                          required
                        />
                        {addressError && (
                          <p className="mt-1 text-xs text-red-500">{addressError}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          {deliveryAddress.length}/500 characters
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Order Summary
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">ETB {calculateTotal()}</span>
              </div>
              {deliveryOption === 'delivery' && (
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">ETB 29.99</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-2">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">ETB {calculateGrandTotal()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              <button
                onClick={clearCart}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base shadow-xs hover:shadow-sm"
              >
                Clear Cart
              </button>
              <button
                onClick={placeOrder}
                disabled={orderLoading || (deliveryOption === 'delivery' && !deliveryAddress && !position)}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center ${
                  orderLoading || (deliveryOption === 'delivery' && !deliveryAddress && !position) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {orderLoading || paymentLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Place Order & Pay'
                )}
              </button>
              {deliveryOption === 'delivery' && !deliveryAddress && !position && (
                <p className="text-red-500 text-sm text-center">
                  Please provide either a delivery address or select your location on the map
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;