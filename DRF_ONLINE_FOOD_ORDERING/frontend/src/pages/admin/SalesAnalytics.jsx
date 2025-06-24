import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SalesAnalytics = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [orderData, setOrderData] = useState({ labels: [], datasets: [] });
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Call the correct analytics endpoint with time range parameter
        const response = await api.get(`/api/admin/sales-analytics/?range=${timeRange}`);
        
        // Fallback for development (remove in production)
        const data = response.data?.labels ? response.data : generateMockData();
        
        // Process order data
        setOrderData({
          labels: data.labels,
          datasets: [{
            label: 'Orders',
            data: data.orders,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 4,
          }]
        });
        
        // Process revenue data
        setRevenueData({
          labels: data.labels,
          datasets: [{
            label: 'Revenue (ETB)',
            data: data.revenue,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            tension: 0.4,
          }]
        });
        
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function for mock data (remove when backend is ready)
    const generateMockData = () => {
      const now = new Date();
      const labels = timeRange === 'weekly' 
        ? Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return format(date, 'EEE');
          })
        : Array.from({ length: 12 }, (_, i) => 
            format(new Date(now.getFullYear(), i, 1), 'MMM'));
      
      return {
        labels,
        orders: labels.map(() => Math.floor(Math.random() * 100) + 20),
        revenue: labels.map(() => Math.floor(Math.random() * 5000) + 1000)
      };
    };

    fetchAnalytics();
  }, [timeRange]);

  // Chart configuration options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          },
          padding: 20
        }
      },
      title: {
        display: true,
        font: {
          size: 18
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            if (context.dataset.label === 'Orders') {
              return `${context.dataset.label}: ${context.raw}`;
            } else {
              return `${context.dataset.label}: ${context.raw.toLocaleString()} ETB`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value) => value // Remove currency symbol for all y-axis ticks
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Calculate summary metrics
  const totalOrders = orderData.datasets[0]?.data?.reduce((a, b) => a + b, 0) || 0;
  const totalRevenue = revenueData.datasets[0]?.data?.reduce((a, b) => a + b, 0) || 0;
  const avgOrderValue = totalRevenue / (totalOrders || 1);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Sales Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('weekly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'weekly' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'monthly' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-blue-600">
                {totalOrders.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {timeRange === 'weekly' ? 'This week' : 'This year'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {totalRevenue.toLocaleString()} ETB
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {timeRange === 'weekly' ? 'Weekly sales' : 'Annual sales'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Avg. Order Value</h3>
              <p className="text-3xl font-bold text-purple-600">
                {avgOrderValue.toFixed(2)} ETB
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Across all orders
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Volume</h2>
              <div className="h-80">
                <Bar 
                  data={orderData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: timeRange === 'weekly' ? 'Weekly Orders' : 'Monthly Orders',
                      }
                    }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Revenue Trend</h2>
              <div className="h-80">
                <Line 
                  data={revenueData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: timeRange === 'weekly' ? 'Weekly Revenue (ETB)' : 'Monthly Revenue (ETB)',
                      }
                    },
                    scales: {
                      ...chartOptions.scales,
                      y: {
                        ...chartOptions.scales.y,
                        ticks: {
                          callback: (value) => `${value} ETB`
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesAnalytics;