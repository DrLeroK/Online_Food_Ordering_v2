import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ACCESS_TOKEN } from "./constants";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import ItemCreate from "./pages/items/ItemCreate";
import ItemList from "./pages/items/ItemList";
import ItemDetail from "./pages/items/ItemDetail";
import CartPage from "./pages/cart/CartPage";
import OrderHistoryPage from "./pages/orders/OrderHistoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsAuthenticated(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <main className="min-h-screen">
        <Routes>

          {/* <Route
          path="/home"
          element={
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
          }
        /> */}

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/items" element={<ItemList />} />
          <Route path="/items/create" element={<ItemCreate />} />
          <Route path="/menu/items" element={<ItemList />} />
          <Route path="/menu/items/:slug" element={<ItemDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
                <AdminDashboard />
            </ProtectedRoute>
          }
        />

          {/* Redirect to home if no match */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;



















// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';
// import Sidebar from '../components/Admin/Sidebar';
// import OrderTable from '../components/Admin/OrderTable';
// import StatsCards from '../components/Admin/StatsCards';
// import ItemsList from '../components/Admin/ItemsList';
// import SalesAnalytics from '../components/Admin/SalesAnalytics';
// import TopItems from '../components/Admin/TopItems';
// import OrderDetailsModal from '../components/Admin/OrderDetailsModal';
// import DateFilter from '../components/Admin/DateFilter';
// import { ACCESS_TOKEN } from '../constants';

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [stats, setStats] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [items, setItems] = useState([]);
//   const [topItems, setTopItems] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [loading, setLoading] = useState({
//     dashboard: true,
//     items: true,
//     sales: true,
//     topItems: true
//   });
//   const [error, setError] = useState(null);
//   const [dateRange, setDateRange] = useState({
//     start: '',
//     end: ''
//   });
//   const [timeRange, setTimeRange] = useState('weekly');
//   const navigate = useNavigate();

//   const handleStatusUpdate = async (orderId, newStatus) => {
//     try {
//       const response = await api.post(`api/admin/orders/${orderId}/update_status/`, {
//         status: newStatus
//       });
//       fetchOrders();
//       return true;
//     } catch (err) {
//       console.error('Status update failed:', err.response?.data);
//       setError(err.response?.data?.error || 'Failed to update order status');
//       return false;
//     }
//   };

//   const handleCancel = async (orderId, reason) => {
//     if (!reason) {
//       setError('Please provide a cancellation reason');
//       return false;
//     }

//     try {
//       setLoading(prev => ({ ...prev, dashboard: true }));
//       const response = await api.post(`api/admin/orders/${orderId}/cancel/`, {
//         cancel_reason: reason
//       });
      
//       setOrders(prevOrders => 
//         prevOrders.map(order => 
//           order.id === orderId 
//             ? { ...order, 
//                 status: 'Cancelled',
//                 cancel_reason: reason,
//                 cancelled_at: new Date().toISOString()
//               } 
//             : order
//         )
//       );
      
//       return true;
//     } catch (err) {
//       console.error('Cancel failed:', err);
//       setError(err.response?.data?.error || 'Failed to cancel order');
//       return false;
//     } finally {
//       setLoading(prev => ({ ...prev, dashboard: false }));
//     }
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(prev => ({ ...prev, dashboard: true }));
//       setError(null);
      
//       const config = {
//         params: {
//           ...(dateRange.start && { start_date: dateRange.start }),
//           ...(dateRange.end && { end_date: dateRange.end })
//         },
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
//         }
//       };

//       const [statsRes, ordersRes] = await Promise.all([
//         api.get('api/admin/orders/dashboard/', config),
//         api.get('api/admin/orders/', config)
//       ]);
      
//       setStats(statsRes.data);
//       setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
//     } catch (err) {
//       handleError(err);
//     } finally {
//       setLoading(prev => ({ ...prev, dashboard: false }));
//     }
//   };

//   const fetchItems = async () => {
//     try {
//       setLoading(prev => ({ ...prev, items: true }));
//       const response = await api.get('menu/items/');
//       setItems(response.data);
//     } catch (err) {
//       handleError(err);
//     } finally {
//       setLoading(prev => ({ ...prev, items: false }));
//     }
//   };

//   const fetchTopItems = async () => {
//     try {
//       setLoading(prev => ({ ...prev, topItems: true }));
//       const response = await api.get('api/admin/orders/dashboard/');
//       setTopItems(response.data.popular_items || []);
//     } catch (err) {
//       handleError(err);
//     } finally {
//       setLoading(prev => ({ ...prev, topItems: false }));
//     }
//   };

//   const handleError = (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem(ACCESS_TOKEN);
//       navigate('/login');
//     }
//     console.error('Error:', err);
//     setError(err.message || 'Failed to load data');
//   };

//   useEffect(() => {
//     if (activeTab === 'dashboard') {
//       fetchDashboardData();
//     } else if (activeTab === 'items') {
//       fetchItems();
//     } else if (activeTab === 'topItems') {
//       fetchTopItems();
//     }
//   }, [activeTab, dateRange]);

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return (
//           <>
//             <StatsCards stats={stats} />
//             <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
//               {orders.length > 0 ? (
//                 <OrderTable
//                   orders={orders}
//                   onStatusUpdate={handleStatusUpdate}
//                   onCancel={handleCancel}
//                   onViewDetails={setSelectedOrder}
//                 />
//               ) : (
//                 <div className="p-8 text-center text-gray-500">
//                   No orders found for the selected criteria
//                 </div>
//               )}
//             </div>
//           </>
//         );
//       case 'items':
//         return (
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <ItemsList items={items} loading={loading.items} />
//           </div>
//         );
//       case 'sales':
//         return (
//           <SalesAnalytics 
//             stats={stats} 
//             timeRange={timeRange} 
//             setTimeRange={setTimeRange} 
//           />
//         );
//       case 'topItems':
//         return (
//           <div className="bg-white rounded-lg shadow overflow-hidden p-6">
//             <TopItems topItems={topItems} loading={loading.topItems} />
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   if (loading.dashboard && activeTab === 'dashboard') {
//     return <div className="flex justify-center items-center h-64">Loading admin dashboard...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 p-4">{error}</div>;
//   }

//   return (
//     <div className="flex">
//       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
//       <div className="flex-1 p-8">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-bold">
//             {activeTab === 'dashboard' && 'Dashboard'}
//             {activeTab === 'items' && 'Manage Items'}
//             {activeTab === 'sales' && 'Sales Analytics'}
//             {activeTab === 'topItems' && 'Top Selling Items'}
//           </h1>
//           {activeTab === 'dashboard' && (
//             <DateFilter 
//               dateRange={dateRange}
//               setDateRange={setDateRange}
//             />
//           )}
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         {renderContent()}
//       </div>

//       {selectedOrder && (
//         <OrderDetailsModal 
//           order={selectedOrder} 
//           onClose={() => setSelectedOrder(null)} 
//         />
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;








// import ItemEdit from "./pages/ItemEdit"; // New component
// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     setIsAuthenticated(!!token);
//     // In a real app, you'd verify admin status from an API or token claims
//     setIsAdmin(!!token); // Simplified for demo
//   }, []);

//   return (
//     <BrowserRouter>
//       <Navbar 
//         isAuthenticated={isAuthenticated} 
//         isAdmin={isAdmin}
//         setIsAuthenticated={setIsAuthenticated} 
//       />
//       <main className="min-h-screen">
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
//           <Route path="/signup" element={<SignUp />} />
//           <Route path="/items" element={<ItemList />} />
//           <Route path="/menu/items" element={<ItemList />} />
//           <Route path="/menu/items/:slug" element={<ItemDetail />} />
          
//           {/* Protected routes */}
//           <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
//             <Route path="/items/create" element={<ItemCreate />} />
//             {/* <Route path="/menu/items/:slug/edit" element={<ItemEdit />} /> */}
//             <Route path="/cart" element={<CartPage />} />
//             <Route path="/order-history" element={<OrderHistoryPage />} />
//           </Route>

//           {/* Admin routes */}
//           <Route element={<AdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}>
//             <Route path="/admin" element={<AdminDashboard />}>
//               <Route path="dashboard" element={<AdminDashboardPage />} />
//               <Route path="items" element={<AdminItems />} />
//               <Route path="sales" element={<AdminSales />} />
//               <Route path="top-items" element={<AdminTopItems />} />
//               <Route index element={<Navigate to="dashboard" replace />} />
//             </Route>
//           </Route>

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </main>
//       <Footer />
//     </BrowserRouter>
//   );
// }

// export default App;



















// # class OrderItemSerializer(serializers.ModelSerializer):
// #     item = serializers.SerializerMethodField()
// #     item_id = serializers.IntegerField(source='item.id')
// #     item_title = serializers.CharField(source='item.title')
// #     item_price = serializers.DecimalField(source='item.price', max_digits=6, decimal_places=2, coerce_to_string=False)
// #     item_image = serializers.SerializerMethodField()  # Add this line

// #     class Meta:
// #         model = CartItems
// #         fields = [
// #             'id', 'item', 'item_id', 'item_title', 'item_price',
// #             'quantity', 'status', 'item_image'
// #         ]
   
// #     def get_item(self, obj):
// #         if obj.item:  # Check if item exists
// #             # Return minimal item info to avoid nested queries
// #             return {
// #                 'id': obj.item.id,
// #                 'title': obj.item.title,
// #                 'price': str(obj.item.price),
// #                 # 'image': obj.item.image if obj.item.image else None
// #             }
// #         return None
    
// #     # def get_item_image(self, obj):
// #     #     if obj.item.image:
// #     #         return self.context['request'].build_absolute_uri(obj.item.image.url)
// #     #     return None
    
// #     def get_item_image(self, obj):
// #         if not obj.item or not obj.item.image:
// #             return None
            
// #         request = self.context.get('request')
// #         if request:
// #             return request.build_absolute_uri(obj.item.image.url)
// #         return obj.item.image.url  # Fallback to relative URL
















// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';
// import LoadingIndicator from '../components/LoadingIndicator';

// const ItemCreate = () => {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: 'burger',
//     size: '',
//     price: '',
//     labels: '',
//     label_colour: '',
//     image: null, // Added for file upload
//   });
//   const [previewImage, setPreviewImage] = useState(null); // For image preview
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result);
//       };
//       reader.readAsDataURL(file);
      
//       // Update form data
//       setFormData({
//         ...formData,
//         image: file,
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       const formDataToSend = new FormData();
      
//       // Append all form fields to FormData
//       Object.keys(formData).forEach(key => {
//         if (formData[key] !== null && formData[key] !== undefined) {
//           formDataToSend.append(key, formData[key]);
//         }
//       });

//       const config = {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       };

//       await api.post('/menu/items/', formDataToSend, config);
//       navigate('/admin/items'); // Redirect to items list after successful creation
//     } catch (err) {
//       if (err.response && err.response.data) {
//         setErrors(err.response.data);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-2xl">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Menu Item</h1>
      
//       {loading && <LoadingIndicator />}
      
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
//         {errors.non_field_errors && (
//           <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
//             {errors.non_field_errors.join(' ')}
//           </div>
//         )}

//         {/* Image Upload Field */}
//         <div className="mb-6">
//           <label className="block text-gray-700 mb-2" htmlFor="image">
//             Item Image
//           </label>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <input
//                 type="file"
//                 id="image"
//                 name="image"
//                 onChange={handleImageChange}
//                 accept="image/*"
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               />
//               <label
//                 htmlFor="image"
//                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200"
//               >
//                 Choose Image
//               </label>
//             </div>
//             {previewImage && (
//               <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
//                 <img 
//                   src={previewImage} 
//                   alt="Preview" 
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             )}
//           </div>
//           {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="title">
//             Title*
//           </label>
//           <input
//             type="text"
//             id="title"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             required
//           />
//           {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="description">
//             Description
//           </label>
//           <textarea
//             id="description"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             rows="3"
//           />
//           {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="category">
//               Category*
//             </label>
//             <select
//               id="category"
//               name="category"
//               value={formData.category}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//               required
//             >
//               <option value="burger">Burger</option>
//               <option value="side">Side</option>
//               <option value="drink">Drink</option>
//               <option value="dessert">Dessert</option>
//               <option value="pizza">Pizza</option>
//               <option value="salad">Salad</option>
//               <option value="sandwich">Sandwich</option>
//               <option value="pasta">Pasta</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="size">
//               Size
//             </label>
//             <select
//               id="size"
//               name="size"
//               value={formData.size}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="">Select Size</option>
//               <option value="s">Small</option>
//               <option value="m">Medium</option>
//               <option value="l">Large</option>
//             </select>
//           </div>
//         </div>

//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="price">
//             Price*
//           </label>
//           <input
//             type="number"
//             id="price"
//             name="price"
//             value={formData.price}
//             onChange={handleChange}
//             min="0"
//             step="0.01"
//             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             required
//           />
//           {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="labels">
//               Label
//             </label>
//             <select
//               id="labels"
//               name="labels"
//               value={formData.labels}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="">No Label</option>
//               <option value="bestseller">BestSeller</option>
//               <option value="new">New</option>
//               <option value="spicy🔥">Spicy🔥</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="label_colour">
//               Label Color
//             </label>
//             <select
//               id="label_colour"
//               name="label_colour"
//               value={formData.label_colour}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="">Default</option>
//               <option value="danger">Red</option>
//               <option value="success">Green</option>
//               <option value="primary">Blue</option>
//               <option value="info">Teal</option>
//             </select>
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={() => navigate('/items')}
//             className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             Save Item
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ItemCreate;




// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ACCESS_TOKEN } from '../constants';

// const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem(ACCESS_TOKEN);
//     setIsAuthenticated(false);
//     navigate('/');
//   };

//   return (
//     <nav className="bg-white shadow-lg">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="flex justify-between">
//           <div className="flex space-x-7">
//             <div>
//               <Link to="/" className="flex items-center py-4 px-2">
//                 <span className="font-semibold text-gray-900 text-2xl">
//                   <span className="text-red-600">Atlas</span> Burgers
//                 </span>
//               </Link>
//             </div>
//           </div>
          
//           <div className="hidden md:flex items-center space-x-3">
//             <Link 
//               to="/" 
//               className="py-4 px-2 text-gray-700 hover:text-red-600 transition duration-300"
//             >
//               Home
//             </Link>
//             <Link 
//               to="/menu" 
//               className="py-4 px-2 text-gray-700 hover:text-red-600 transition duration-300"
//             >
//               Menu
//             </Link>
//             <Link 
//               to="/about" 
//               className="py-4 px-2 text-gray-700 hover:text-red-600 transition duration-300"
//             >
//               About
//             </Link>
//           </div>
          
//           <div className="hidden md:flex items-center space-x-3">
//             {!isAuthenticated ? (
//               <>
//                 <Link 
//                   to="/login" 
//                   className="py-2 px-4 text-gray-700 hover:text-red-600 transition duration-300"
//                 >
//                   Login
//                 </Link>
//                 <Link 
//                   to="/signup" 
//                   className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
//                 >
//                   Sign Up
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link 
//                   to="/profile" 
//                   className="py-2 px-4 text-gray-700 hover:text-red-600 transition duration-300"
//                 >
//                   Profile
//                 </Link>
//                 <button 
//                   onClick={handleLogout}
//                   className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
//                 >
//                   Logout
//                 </button>
//               </>
//             )}
//           </div>
          
//           {/* Mobile button */}
//           <div className="md:hidden flex items-center">
//             <button className="outline-none mobile-menu-button">
//               <svg 
//                 className="w-6 h-6 text-gray-700"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth="2" 
//                   d="M4 6h16M4 12h16M4 18h16"
//                 ></path>
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Mobile menu */}
//       <div className="hidden mobile-menu">
//         <ul className="">
//           <li className="active">
//             <Link to="/" className="block text-sm px-2 py-4 text-white bg-red-600 font-semibold">
//               Home
//             </Link>
//           </li>
//           <li>
//             <Link to="/menu" className="block text-sm px-2 py-4 hover:bg-red-600 hover:text-white transition duration-300">
//               Menu
//             </Link>
//           </li>
//           <li>
//             <Link to="/about" className="block text-sm px-2 py-4 hover:bg-red-600 hover:text-white transition duration-300">
//               About
//             </Link>
//           </li>
//           {!isAuthenticated ? (
//             <>
//               <li>
//                 <Link to="/login" className="block text-sm px-2 py-4 hover:bg-red-600 hover:text-white transition duration-300">
//                   Login
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/signup" className="block text-sm px-2 py-4 hover:bg-red-600 hover:text-white transition duration-300">
//                   Sign Up
//                 </Link>
//               </li>
//             </>
//           ) : (
//             <>
//               <li>
//                 <Link to="/profile" className="block text-sm px-2 py-4 hover:bg-red-600 hover:text-white transition duration-300">
//                   Profile
//                 </Link>
//               </li>
//               <li>
//                 <button 
//                   onClick={handleLogout}
//                   className="block w-full text-left text-sm px-2 py-4 hover:bg-red-600 hover:text-white transition duration-300"
//                 >
//                   Logout
//                 </button>
//               </li>
//             </>
//           )}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;