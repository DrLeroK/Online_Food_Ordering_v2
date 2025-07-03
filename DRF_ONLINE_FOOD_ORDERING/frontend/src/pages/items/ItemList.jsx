import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaUtensils, FaArrowRight, FaFilter, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { ACCESS_TOKEN } from '../../constants';

const ItemList = () => {
  
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantity, setQuantity] = useState({});
  const [cartLoading, setCartLoading] = useState({});
  const navigate = useNavigate();

  // Check authentication
  const isAuthenticated = !!localStorage.getItem(ACCESS_TOKEN);

  // Extract unique categories
  const categories = ['all', ...new Set(items.map(item => item.category))];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/menu/items/');
        const sortedItems = response.data.sort((a, b) => a.title.localeCompare(b.title));
        setItems(sortedItems);
        setFilteredItems(sortedItems);
        
        const initialQuantities = {};
        const initialLoadingStates = {};
        sortedItems.forEach(item => {
          initialQuantities[item.id] = 1;
          initialLoadingStates[item.id] = false;
        });
        setQuantity(initialQuantities);
        setCartLoading(initialLoadingStates);
      } catch (err) {
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter items by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);

  const handleAddToCart = async (itemId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCartLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      for (let i = 0; i < quantity[itemId]; i++) {
        await api.post(`/cart/items/add/${items.find(item => item.id === itemId).slug}/`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add item to cart');
    } finally {
      setCartLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const incrementQuantity = (itemId) => {
    setQuantity(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
  };

  const decrementQuantity = (itemId) => {
    if (quantity[itemId] > 1) {
      setQuantity(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    }
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <FaUtensils className="text-red-600 text-3xl mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">
            Our <span className="text-red-600">Menu</span>
          </h1>
        </div>
        <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our delicious selection of food, made with the freshest ingredients
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md sticky top-0 z-10">
        <div className="flex items-center mb-4">
          <FaFilter className="text-red-600 mr-2" />
          <h3 className="font-semibold text-lg">Filter by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
          >
            {/* Image with fallback */}
            <div className="w-full h-56 bg-gray-100 overflow-hidden relative">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/default-food.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <FaUtensils className="h-16 w-16" />
                </div>
              )}
              {item.labels && (
                <span className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${
                  item.label_colour === 'danger' ? 'bg-red-100 text-red-800' :
                  item.label_colour === 'success' ? 'bg-green-100 text-green-800' :
                  item.label_colour === 'primary' ? 'bg-blue-100 text-blue-800' :
                  item.label_colour === 'info' ? 'bg-teal-100 text-teal-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.labels}
                </span>
              )}
            </div>
            
            {/* Item Details */}
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                  {item.size === 's' ? 'Small' : 
                   item.size === 'm' ? 'Medium' : 
                   item.size === 'l' ? 'Large' : ''}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-red-600">ETB {item.price}</span>
                <Link 
                  to={`/menu/items/${item.slug}`}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center text-sm"
                >
                  View Details <FaArrowRight className="ml-1" />
                </Link>
              </div>

              {/* Add to Cart Section */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-gray-700 text-sm">Qty:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button 
                      onClick={() => decrementQuantity(item.id)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                      disabled={quantity[item.id] <= 1}
                    >
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 border-x border-gray-200 font-medium text-sm">{quantity[item.id]}</span>
                    <button 
                      onClick={() => incrementQuantity(item.id)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item.id)}
                  disabled={cartLoading[item.id]}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg"
                >
                  {cartLoading[item.id] ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;