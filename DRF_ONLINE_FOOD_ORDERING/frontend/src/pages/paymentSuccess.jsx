import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-700 mb-6">Thank you for your payment. Your order has been placed successfully.</p>
        <button
          onClick={() => navigate('/order-history')}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          View Order History
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess; 