import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';


const statusColors = {
  Active: 'bg-blue-100 text-blue-800',
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date) ? 'N/A' : date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  const numericPrice = Number(price) || 0;
  return numericPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  });
};

const OrderTable = ({ orders = [], onStatusUpdate, onCancel, onViewDetails, newOrdersCount, onDismissNotification }) => {
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    orderId: null,
    reason: ''
  });
  const [isCancelling, setIsCancelling] = useState(false);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const handleStatusChange = async (orderId, e) => {
    const newStatus = e.target.value;
    await onStatusUpdate(orderId, newStatus);
  };

  const openCancelModal = (orderId) => {
    setCancelModal({
      isOpen: true,
      orderId,
      reason: ''
    });
  };

  const closeCancelModal = () => {
    setCancelModal({
      isOpen: false,
      orderId: null,
      reason: ''
    });
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal.reason.trim()) return;
    
    setIsCancelling(true);
    try {
      await onCancel(cancelModal.orderId, cancelModal.reason);
      closeCancelModal();
    } finally {
      setIsCancelling(false);
    }
  };

  if (safeOrders.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-500 text-center">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      {/* Notification Bell */}
      {newOrdersCount > 0 && (
        <div className="absolute -top-10 right-0">
          <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            <FaBell className="mr-2 animate-pulse" />
            <span>{newOrdersCount} new order{newOrdersCount !== 1 ? 's' : ''}</span>
            <button 
              onClick={onDismissNotification}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Cancel Order #{cancelModal.orderId}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation
              </label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                placeholder="Enter cancellation reason..."
                value={cancelModal.reason}
                onChange={(e) => setCancelModal(prev => ({
                  ...prev,
                  reason: e.target.value
                }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded text-sm"
                onClick={closeCancelModal}
                disabled={isCancelling}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50"
                onClick={handleCancelConfirm}
                disabled={!cancelModal.reason.trim() || isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeOrders.map((order) => (
            <tr 
              key={order.id} 
              className={`
                ${order.status === 'Cancelled' ? 'bg-red-50' : ''}
                ${order.isNew ? 'border-l-4 border-blue-500' : ''}
                relative
              `}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.customer?.username || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.created_at)}
                {order.cancelled_at && (
                  <div className="text-xs text-red-500">
                    Cancelled: {formatDate(order.cancelled_at)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.items?.length || 0} items
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatPrice(order.total_price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.status === 'Cancelled' ? (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors.Cancelled}`}>
                    Cancelled
                  </span>
                ) : (
                  <select
                    value={order.status || 'Active'}
                    onChange={(e) => handleStatusChange(order.id, e)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status] || statusColors.Active}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {order.isNew && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => onViewDetails(order)}
                  className="text-blue-600 hover:text-blue-900 text-xs font-medium mr-3"
                >
                  View
                </button>
                {order.status !== 'Cancelled' && (
                  <button
                    onClick={() => openCancelModal(order.id)}
                    className="text-red-600 hover:text-red-900 text-xs font-medium"
                  >
                    Cancel
                  </button>
                )}
                {order.cancel_reason && (
                  <div className="text-xs text-gray-500 mt-1">
                    Reason: {order.cancel_reason}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;