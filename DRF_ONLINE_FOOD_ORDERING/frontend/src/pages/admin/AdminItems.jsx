import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import ItemsList from '../../components/Admin/ItemsList';
import { ACCESS_TOKEN } from '../../constants';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('menu/items/');
        setItems(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem(ACCESS_TOKEN);
          navigate('/login');
        }
        setError(err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [navigate]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading items...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Items</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ItemsList items={items} loading={loading} />
      </div>
    </div>
  );
};

export default AdminItems;