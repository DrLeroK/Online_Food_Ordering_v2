import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import OrderTable from '../../components/Admin/OrderTable';
import StatsCards from '../../components/Admin/StatsCards';
import DateFilter from '../../components/Admin/DateFilter';
import OrderDetailsModal from '../../components/Admin/OrderDetailsModal';
import { ACCESS_TOKEN } from '../../constants';
import { FaBell, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [timeFilter, setTimeFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [newOrders, setNewOrders] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const ORDERS_PER_PAGE = 10;

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.post(`api/admin/orders/${orderId}/update_status/`, {
        status: newStatus
      });
      fetchDashboardData();
      return true;
    } catch (err) {
      console.error('Status update failed:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to update order status');
      return false;
    }
  };

  const handleCancel = async (orderId, reason) => {
    if (!reason) {
      setError('Please provide a cancellation reason');
      return false;
    }

    try {
      setLoading(true);
      await api.post(`api/admin/orders/${orderId}/cancel/`, {
        cancel_reason: reason
      });
      fetchDashboardData();
      return true;
    } catch (err) {
      console.error('Cancel failed:', err);
      setError(err.response?.data?.error || 'Failed to cancel order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        params: {
          ...(dateRange.start && { start_date: dateRange.start }),
          ...(dateRange.end && { end_date: dateRange.end })
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
        }
      };

      const [statsRes, ordersRes] = await Promise.all([
        api.get('api/admin/orders/dashboard/', config),
        api.get('api/admin/orders/', config)
      ]);

      setStats(statsRes.data);
      const fetchedOrders = Array.isArray(ordersRes?.data) ? ordersRes.data : [];
      setOrders(fetchedOrders);

      // Check for new orders
      const storedSeenOrders = JSON.parse(localStorage.getItem('seenOrders')) || [];
      const newUnseenOrders = fetchedOrders.filter(
        order => !storedSeenOrders.includes(order.id)
      );
      
      if (newUnseenOrders.length > 0) {
        setNewOrders(newUnseenOrders);
        setShowNotification(true);
      }

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN);
        navigate('/login');
      } else {
        console.error('Error:', err);
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const markOrdersAsSeen = () => {
    const allOrderIds = orders.map(order => order.id);
    localStorage.setItem('seenOrders', JSON.stringify(allOrderIds));
    setNewOrders([]);
    setShowNotification(false);
  };

  const applyTimeFilter = () => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (timeFilter) {
      case 'yesterday':
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= yesterday && orderDate < today;
        });
      case 'today':
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= today && orderDate < tomorrow;
        });
      case 'tomorrow':
        return orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= tomorrow;
        });
      default:
        return orders;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  useEffect(() => {
    setFilteredOrders(applyTimeFilter());
    setCurrentPage(1); // Reset to first page when filter changes
  }, [timeFilter, orders]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  if (loading) return <div className="flex justify-center items-center h-64">Loading admin dashboard...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Notification for new orders */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50">
          <div 
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg flex items-center"
            role="alert"
          >
            <FaBell className="mr-2 text-blue-500" />
            <div>
              <p className="font-bold">New Orders!</p>
              <p>{newOrders.length} new order{newOrders.length !== 1 ? 's' : ''} received</p>
            </div>
            <button 
              onClick={markOrdersAsSeen}
              className="ml-4 text-blue-700 hover:text-blue-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          {showStats ? (
            <>
              <FaEyeSlash className="mr-1" /> Hide Stats
            </>
          ) : (
            <>
              <FaEye className="mr-1" /> Show Stats
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showStats && <StatsCards stats={stats} />}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Order List</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <label htmlFor="timeFilter" className="text-sm text-gray-600">Time Filter:</label>
              <select
                id="timeFilter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="all">All</option>
              </select>
            </div>
            <DateFilter 
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
        </div>

        {paginatedOrders.length > 0 ? (
          <>
            <OrderTable
              orders={paginatedOrders.map(order => ({
                ...order,
                isNew: newOrders.some(newOrder => newOrder.id === order.id)
              }))}
              onStatusUpdate={handleStatusUpdate}
              onCancel={handleCancel}
              onViewDetails={(order) => {
                setSelectedOrder(order);
                if (newOrders.some(newOrder => newOrder.id === order.id)) {
                  setNewOrders(newOrders.filter(newOrder => newOrder.id !== order.id));
                }
              }}
            />
            
            {/* Pagination controls */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ORDERS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}
                </span>{' '}
                of <span className="font-medium">{filteredOrders.length}</span> orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No orders found for the selected criteria
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;