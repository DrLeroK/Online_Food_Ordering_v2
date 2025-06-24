import React from 'react';
import { FaCopy, FaShare, FaMapMarkerAlt, FaStore, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  // Safely format price
  const formatPrice = (price) => {
    try {
      const numericPrice = Number(price) || 0;
      return numericPrice.toLocaleString('en-US', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 2
      });
    } catch {
      return 'ETB 0.00';
    }
  };

  // Safely format date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Safely get coordinates for display
  const getCoordinates = (lat, lng) => {
    try {
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (isNaN(latitude) || isNaN(longitude)) return null;
      return {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6)
      };
    } catch {
      return null;
    }
  };

  const copyOrderDetails = () => {
    const coordinates = getCoordinates(order.latitude, order.longitude);
    const orderDetails = `
Order #${order.id || 'N/A'}
Status: ${order.status || 'N/A'}
Date: ${formatDate(order.created_at)}
Total: ${formatPrice(order.total_price)}
Delivery Method: ${order.delivery_option || 'N/A'}

${order.delivery_option === 'delivery' ? `
Delivery Address: ${order.delivery_address || 'N/A'}
${coordinates ? `Location: https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=16/${coordinates.latitude}/${coordinates.longitude}` : ''}
Delivery Time: ${formatDate(order.delivery_time)}
` : `
Pickup Branch: ${order.pickup_branch_display || order.pickup_branch || 'N/A'}
Pickup Time: ${formatDate(order.pickup_time)}
`}

Items:
${order.items?.map(item => `
- ${item.item_title || '[Deleted Item]'} 
  ${item.quantity || 0} × ${formatPrice(item.item_price)} = ${formatPrice((item.quantity || 0) * (item.item_price || 0))}
`).join('')}
    `.trim();

    navigator.clipboard.writeText(orderDetails);
    toast.success('Order details copied to clipboard!');
  };

  const shareOrderDetails = async () => {
    const shareData = {
      title: `Order #${order.id || ''} Details`,
      text: `Here are the details for order #${order.id || ''}`,
      url: window.location.href
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log('Sharing cancelled or not supported');
      copyOrderDetails();
    }
  };

  // Safely get delivery/pickup information
  const deliveryInfo = order.delivery_option === 'delivery' ? {
    address: order.delivery_address || 'N/A',
    time: formatDate(order.delivery_time),
    coordinates: getCoordinates(order.latitude, order.longitude)
  } : {
    branch: order.pickup_branch_display || order.pickup_branch || 'N/A',
    time: formatDate(order.pickup_time)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-0 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Order #{order.id || 'N/A'}</h3>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status || 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={shareOrderDetails}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Share order"
              >
                <FaShare className="w-5 h-5" />
              </button>
              <button 
                onClick={copyOrderDetails}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Copy order details"
              >
                <FaCopy className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Customer and Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {order.customer?.username || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {order.customer?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Date:</span> {formatDate(order.created_at)}</p>
                <p><span className="font-medium">Total:</span> {formatPrice(order.total_price)}</p>
                <p><span className="font-medium">Method:</span> <span className="capitalize">{order.delivery_option || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          {/* Delivery/Pickup Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              {order.delivery_option === 'delivery' ? (
                <>
                  <FaMapMarkerAlt className="w-5 h-5 mr-2 text-gray-500" />
                  Delivery Information
                </>
              ) : (
                <>
                  <FaStore className="w-5 h-5 mr-2 text-gray-500" />
                  Pickup Information
                </>
              )}
            </h4>
            
            {order.delivery_option === 'delivery' ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Delivery Address:</p>
                  <p>{deliveryInfo.address}</p>
                </div>
                
                {deliveryInfo.coordinates && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Location Coordinates:</p>
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${deliveryInfo.coordinates.latitude}&mlon=${deliveryInfo.coordinates.longitude}#map=16/${deliveryInfo.coordinates.latitude}/${deliveryInfo.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                    >
                      <FaMapMarkerAlt className="mr-1" />
                      View on Map
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      {deliveryInfo.coordinates.latitude}, {deliveryInfo.coordinates.longitude}
                    </p>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Scheduled Delivery Time:</p>
                  <p>{deliveryInfo.time}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Pickup Branch:</p>
                  <p>{deliveryInfo.branch}</p>
                </div>
                
                <div>
                  <p className="font-medium">Scheduled Pickup Time:</p>
                  <p>{deliveryInfo.time}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Order Items
            </h4>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 p-3 border-b border-gray-200">
                <div className="col-span-6 font-medium text-sm text-gray-500 uppercase">Item</div>
                <div className="col-span-2 font-medium text-sm text-gray-500 uppercase text-right">Price</div>
                <div className="col-span-2 font-medium text-sm text-gray-500 uppercase text-right">Qty</div>
                <div className="col-span-2 font-medium text-sm text-gray-500 uppercase text-right">Total</div>
              </div>
              
              {order.items?.map((item) => (
                <div key={item.id || Math.random()} className="grid grid-cols-12 p-3 border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <div className="col-span-6 flex items-center">
                    {item.item_image && (
                      <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                        <img 
                          className="w-full h-full object-cover" 
                          src={item.item_image} 
                          alt={item.item_title || 'Item'} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-food.png';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.item_title || '[Deleted Item]'}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 text-right self-center">
                    {formatPrice(item.item_price || 0)}
                  </div>
                  <div className="col-span-2 text-sm text-gray-600 text-right self-center">
                    {item.quantity || 0}
                  </div>
                  <div className="col-span-2 text-sm font-medium text-gray-800 text-right self-center">
                    {formatPrice((item.quantity || 0) * (item.item_price || 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Reason */}
          {order.cancel_reason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Cancellation Reason</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>{order.cancel_reason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;


