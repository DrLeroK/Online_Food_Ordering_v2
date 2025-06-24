import React from 'react';
import { FaBoxOpen, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  // Return null or loading state if stats is not available
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((item) => (
          <div 
            key={item} 
            className="bg-white p-6 rounded-xl shadow-md animate-pulse border border-gray-100"
          >
            <div className="h-5 w-3/4 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-8 w-1/2 bg-gray-300 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  const cardData = [
    {
      title: 'Total Orders',
      value: stats.total_orders || 0,
      change: null,
      icon: <FaBoxOpen className="text-2xl" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Recent Orders (7d)',
      value: stats.recent_orders || 0,
      change: null,
      icon: <FaCalendarAlt className="text-2xl" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `ETB ${(stats.total_revenue || 0).toFixed(2)}`,
      change: null,
      icon: <FaDollarSign className="text-2xl" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cardData.map((card, index) => (
        <div 
          key={index} 
          className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 ${card.bgColor}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${card.textColor}`}>
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
            </div>
            <span className={`p-3 rounded-full ${card.textColor}`}>
              {card.icon}
            </span>
          </div>
          
          {card.change !== null && (
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;