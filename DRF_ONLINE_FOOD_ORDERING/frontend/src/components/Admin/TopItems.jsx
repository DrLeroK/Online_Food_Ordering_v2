import React from 'react';

const TopItems = ({ topItems, loading }) => {
  // Better loading state
  if (loading) return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={`skeleton-${i}`} className="py-4 border-t border-gray-200">
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  // Better empty state
  if (!topItems || topItems.length === 0) return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <p className="text-gray-500">No top selling items found</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Top Selling Items</h3>
      <ul className="divide-y divide-gray-200">
        {topItems.map((item, index) => (
          <li key={`${item.id}-${index}`} className="py-4"> {/* More unique key */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-500 w-8">#{index + 1}</span>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {item.item__title || 'Untitled Item'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.count} {item.count === 1 ? 'sale' : 'sales'}
                  </p>
                </div>
              </div>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopItems;

