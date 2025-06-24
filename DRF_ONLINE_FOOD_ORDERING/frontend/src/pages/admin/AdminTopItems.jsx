import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import TopItems from '../../components/Admin/TopItems';
import { ACCESS_TOKEN } from '../../constants';


const AdminTopItems = () => {
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopItems = async () => {
      try {
        const response = await api.get('api/admin/orders/dashboard/');
        setTopItems(response.data.popular_items || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem(ACCESS_TOKEN);
          navigate('/login');
        }
        setError(err.message || 'Failed to load top items');
      } finally {
        setLoading(false);
      }
    };

    fetchTopItems();
  }, [navigate]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading top items...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Top Selling Items</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <TopItems topItems={topItems} loading={loading} />
      </div>
    </div>
  );
};

export default AdminTopItems;