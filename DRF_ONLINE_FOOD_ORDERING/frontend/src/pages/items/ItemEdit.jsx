import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import LoadingIndicator from '../../components/LoadingIndicator';

const ItemEdit = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'burger',
    size: '',
    price: '',
    labels: '',
    label_colour: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [originalImage, setOriginalImage] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/menu/items/${slug}/`);
        setFormData(response.data);
        setOriginalImage(response.data.image);
        if (response.data.image) {
          setPreviewImage(response.data.image);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      
      // Append all fields individually
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      if (formData.size) formDataToSend.append('size', formData.size);
      formDataToSend.append('price', formData.price);
      if (formData.labels) formDataToSend.append('labels', formData.labels);
      if (formData.label_colour) formDataToSend.append('label_colour', formData.label_colour);
      
      // Handle image upload differently
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      } else if (formData.image === null) {
        // If image was cleared
        formDataToSend.append('image', '');
      }

      // Debug: Log FormData contents
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await api.patch(`/menu/items/${slug}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Item updated:', response.data);
      navigate('/admin/items');
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: ['Failed to update item'] });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Menu Item</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {errors.non_field_errors && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {Array.isArray(errors.non_field_errors) 
              ? errors.non_field_errors.join(' ') 
              : errors.non_field_errors}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="image">
            Item Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <label
                htmlFor="image"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200"
              >
                {formData.image instanceof File ? 'Change Image' : 'Upload Image'}
              </label>
            </div>
            {previewImage && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">
              {Array.isArray(errors.image) ? errors.image.join(' ') : errors.image}
            </p>
          )}
          {originalImage && !(formData.image instanceof File) && (
            <p className="text-xs text-gray-500 mt-1">
              Current: <a href={originalImage} target="_blank" rel="noopener noreferrer">View Image</a>
            </p>
          )}
        </div>

        {/* Rest of your form fields remain the same */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="3"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="category">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="burger">Burger</option>
              <option value="side">Side</option>
              <option value="drink">Drink</option>
              <option value="dessert">Dessert</option>
              <option value="pizza">Pizza</option>
              <option value="salad">Salad</option>
              <option value="sandwich">Sandwich</option>
              <option value="pasta">Pasta</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="size">
              Size
            </label>
            <select
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select Size</option>
              <option value="s">Small</option>
              <option value="m">Medium</option>
              <option value="l">Large</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="price">
            Price*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="labels">
              Label
            </label>
            <select
              id="labels"
              name="labels"
              value={formData.labels}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">No Label</option>
              <option value="bestseller">BestSeller</option>
              <option value="new">New</option>
              <option value="spicy🔥">Spicy🔥</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="label_colour">
              Label Color
            </label>
            <select
              id="label_colour"
              name="label_colour"
              value={formData.label_colour}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Default</option>
              <option value="danger">Red</option>
              <option value="success">Green</option>
              <option value="primary">Blue</option>
              <option value="info">Teal</option>
            </select>
          </div>
        </div>
        {/* ... */}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/items')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemEdit;