import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-lg text-gray-700 mb-6">Unfortunately, your payment could not be processed. Please try again or use a different payment method.</p>
        <button
          onClick={() => navigate('/cart')}
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mb-2"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed; 