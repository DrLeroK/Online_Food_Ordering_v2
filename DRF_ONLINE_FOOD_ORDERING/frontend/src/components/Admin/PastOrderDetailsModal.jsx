import React from 'react';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatPrice = (price) => {
    const numericPrice = Number(price) || 0;
    return numericPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Order #{order.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium mb-2">Customer Information</h4>
            <p className="text-sm text-gray-600">
              {order.customer?.username || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">{order.customer?.email || 'N/A'}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Order Information</h4>
            <p className="text-sm text-gray-600">
              Status: <span className="capitalize">{order.status}</span>
            </p>
            <p className="text-sm text-gray-600">
              Date: {new Date(order.created_at).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Total: {formatPrice(order.total_price)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">Delivery Information</h4>
          <p className="text-sm text-gray-600 capitalize">
            Method: {order.delivery_option}
          </p>
          {order.delivery_option === 'delivery' && (
            <p className="text-sm text-gray-600">
              Address: {order.delivery_address || 'N/A'}
            </p>
          )}
          {order.delivery_time && (
            <p className="text-sm text-gray-600">
              Delivery Time: {new Date(order.delivery_time).toLocaleString()}
            </p>
          )}
          {order.pickup_time && (
            <p className="text-sm text-gray-600">
              Pickup Time: {new Date(order.pickup_time).toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <tr key={item.id || Math.random()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.item_image && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={item.item_image} alt={item.item_title || 'Item'} />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.item_title || '[Deleted Item]'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(item.item_price || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice((item.quantity || 0) * (item.item_price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {order.cancel_reason && (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <h4 className="font-medium text-red-800">Cancellation Reason</h4>
            <p className="text-sm text-red-600">{order.cancel_reason}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;