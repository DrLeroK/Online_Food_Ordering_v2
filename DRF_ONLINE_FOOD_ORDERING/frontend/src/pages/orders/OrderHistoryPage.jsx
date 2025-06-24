import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaArrowLeft, FaBoxOpen, FaCheckCircle, FaShoppingBag, FaTruck, FaStore } from 'react-icons/fa';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/history/');
        setOrders(response.data);
      } catch (err) {
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeOrders = orders.filter(order => order.status === 'Active');
  const deliveredOrders = orders.filter(order => order.status === 'Delivered');

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          Your <span className="text-red-600">Order History</span>
        </h1>
        <button 
          onClick={() => navigate('/menu/items')}
          className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Menu
        </button>
      </div>

      {/* Active Orders */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaShoppingBag className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Active Orders</h2>
        </div>
        
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaBoxOpen className="text-gray-300 text-5xl" />
            </div>
            <p className="text-gray-500 text-lg mb-6">No active orders at the moment</p>
            <button
              onClick={() => navigate('/menu/items')}
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Browse Our Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Delivered Orders */}
      <div>
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Delivered Orders</h2>
        </div>
        
        {deliveredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaBoxOpen className="text-gray-300 text-5xl" />
            </div>
            <p className="text-gray-500 text-lg">No delivered orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {deliveredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order }) => {
  const deliveryTime = order.delivery_option === 'pickup' 
    ? order.pickup_time 
    : order.delivery_time;

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
            Order #{order.id}
          </h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
              order.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {order.status}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full font-medium ${
              order.delivery_option === 'pickup' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {order.delivery_option === 'pickup' ? (
                <span className="flex items-center">
                  <FaStore className="mr-2" /> Pickup
                </span>
              ) : (
                <span className="flex items-center">
                  <FaTruck className="mr-2" /> Delivery
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Order Date</p>
            <p className="text-gray-900">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {order.delivery_option === 'pickup' ? 'Pickup Time' : 'Delivery Time'}
            </p>
            <p className="text-gray-900">{formatDate(deliveryTime)}</p>
          </div>
        </div>

        {order.delivery_option === 'delivery' && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Delivery Address</p>
            <p className="text-gray-900">{order.delivery_address}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
          <ul className="space-y-4">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.item_image} 
                        alt={item.item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/default-food.png';
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.item.title}</p>
                    <p className="text-sm text-gray-500">
                      ETB {formatPrice(item.item_price)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">
                  ETB {formatPrice(item.quantity * item.item.price)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-100 pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">ETB {formatPrice(order.total_price)}</span>
            </div>
            {order.delivery_option === 'delivery' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>$29.99</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-semibold text-lg text-red-600">
                ${order.delivery_option === 'delivery' 
                  ? formatPrice(parseFloat(order.total_price) + 29.99)
                  : formatPrice(order.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;