import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaArrowLeft, FaTrash, FaPlus, FaMinus, FaShoppingBasket } from 'react-icons/fa';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [deliveryTime, setDeliveryTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await api.get('/cart/');
        setCartItems(response.data);
      } catch (err) {
        setError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      
      const response = await api.patch(`/cart/items/${itemId}/`, {
        quantity: newQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? response.data : item
      ));
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}/remove/`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.post('/cart/clear/');
      setCartItems([]);
    } catch (err) {
      setError('Failed to clear cart');
    }
  };

  const placeOrder = async () => {
    setOrderLoading(true);
    try {
      await api.post('/orders/', {
        delivery_option: deliveryOption,
        delivery_time: deliveryOption === 'delivery' ? deliveryTime : null,
        pickup_time: deliveryOption === 'pickup' ? deliveryTime : null,
        delivery_address: deliveryOption === 'delivery' ? deliveryAddress : null
      });
      setCartItems([]);
      navigate('/order-history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
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
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          Your <span className="text-red-600">Cart</span>
        </h1>
        <button 
          onClick={() => navigate('/menu/items/')}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Continue Ordering
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <FaShoppingBasket className="text-gray-300 text-5xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
          <button 
            onClick={() => navigate('/menu/items/')}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Browse Our Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {cartItems.map(item => (
              <div key={item.id} className="border-b border-gray-100 last:border-0 p-6">
                <div className="flex flex-col sm:flex-row">
                  {/* Item Image */}
                  <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.item.image} 
                        alt={item.item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/default-food.png';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 flex flex-col sm:flex-row justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900">{item.item.title}</h3>
                      <p className="text-red-600 font-medium">
                        ETB {parseFloat(item.item.price).toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-end">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mr-4">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className="h-3 w-3" />
                        </button>
                        <span className="w-12 h-10 flex items-center justify-center border-x border-gray-300 font-medium">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                        >
                          <FaPlus className="h-3 w-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-2 transition-colors duration-200"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Delivery Options</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <input
                  type="radio"
                  id="pickup"
                  name="deliveryOption"
                  value="pickup"
                  checked={deliveryOption === 'pickup'}
                  onChange={() => setDeliveryOption('pickup')}
                  className="mt-1 mr-3 h-5 w-5 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <label htmlFor="pickup" className="block text-lg font-medium text-gray-900">Pickup from Restaurant</label>
                  {deliveryOption === 'pickup' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                      <input
                        type="datetime-local"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <input
                  type="radio"
                  id="delivery"
                  name="deliveryOption"
                  value="delivery"
                  checked={deliveryOption === 'delivery'}
                  onChange={() => setDeliveryOption('delivery')}
                  className="mt-1 mr-3 h-5 w-5 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <label htmlFor="delivery" className="block text-lg font-medium text-gray-900">Delivery to Address</label>
                  {deliveryOption === 'delivery' && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                        <input
                          type="datetime-local"
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter your full address"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">ETB {calculateTotal()}</span>
              </div>
              {deliveryOption === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">ETB 29.99</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">ETB {calculateGrandTotal()}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={clearCart}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg transition-all duration-200 font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={placeOrder}
                disabled={orderLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
              >
                {orderLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;