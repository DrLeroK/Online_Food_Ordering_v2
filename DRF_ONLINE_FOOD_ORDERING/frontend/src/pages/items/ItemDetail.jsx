import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { FaArrowLeft, FaStar, FaShoppingCart, FaRegComment, FaUser, FaPlus, FaMinus } from 'react-icons/fa';
import { ACCESS_TOKEN } from '../../constants';
import DOMPurify from 'dompurify';

const ItemDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check authentication
  const isAuthenticated = !!localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, reviewsResponse] = await Promise.all([
          api.get(`/menu/items/${slug}/`),
          api.get(`/menu/items/${slug}/reviews/`)
        ]);
        
        setItem(itemResponse.data);
        setReviews(reviewsResponse.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setCartLoading(true);
    setIsAddingToCart(true);
    try {
      const addToCartPromises = [];
      for (let i = 0; i < quantity; i++) {
        addToCartPromises.push(api.post(`/cart/items/add/${item.slug}/`));
      }
      await Promise.all(addToCartPromises);
      
      setError(null);
      // Show success animation
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add item to cart');
      setIsAddingToCart(false);
    } finally {
      setCartLoading(false);
    }
  };

  const sanitizeReview = (text) => {
    // Remove potentially dangerous HTML/JS but preserve line breaks and basic formatting
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      FORBID_ATTR: ['style', 'onerror', 'onload'],
      KEEP_CONTENT: true // Keep text content
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const sanitizedReview = sanitizeReview(reviewText);
      if (!sanitizedReview.trim()) {
        throw new Error('Review cannot be empty');
      }

      const response = await api.post(`/menu/items/${slug}/reviews/`, {
        review: sanitizedReview
      });
      setReviews([...reviews, response.data]);
      setReviewText('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.review?.[0] || err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <LoadingIndicator fullScreen />;
  if (error && !item) return <div className="text-red-500 text-center mt-8 p-4">{error}</div>;
  if (!item) return <div className="text-center mt-8 p-4">Item not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-red-600 hover:text-red-800 mb-6 transition-colors duration-200 group"
        aria-label="Go back to menu"
      >
        <FaArrowLeft className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
        <span className="font-medium">Back to Menu</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Item Image (Full width on mobile, half on desktop) */}
          <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/default-food.png';
                  }}
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {item.labels && (
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full shadow-sm ${
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
          </div>

          {/* Right Side - Item Details and Add to Cart */}
          <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{item.title}</h1>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center flex-wrap gap-2">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">ETB {item.price}</span>
              {item.size && (
                <span className="text-sm sm:text-base text-gray-600 bg-gray-100 px-3 py-1 rounded-full capitalize">
                  {item.size === 's' ? 'Small' : item.size === 'm' ? 'Medium' : 'Large'}
                </span>
              )}
            </div>

            {item.category && (
              <div className="mt-3 sm:mt-4">
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {item.category}
                </span>
              </div>
            )}

            <p className="mt-4 sm:mt-6 text-gray-600 leading-relaxed text-base sm:text-lg">{item.description}</p>

            {/* Add to Cart Section */}
            <div className={`mt-6 sm:mt-8 bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl shadow-inner transition-all duration-300 ${
              isAddingToCart ? 'ring-2 ring-green-500' : ''
            }`}>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <FaShoppingCart className="mr-2 sm:mr-3 text-red-600" />
                <span>Add to Cart</span>
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <label className="text-gray-700 font-medium text-base sm:text-lg">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white w-fit">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <FaMinus className="h-3 w-3" />
                  </button>
                  <span className="px-4 sm:px-6 py-2 border-x border-gray-200 font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Increase quantity"
                  >
                    <FaPlus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center font-medium shadow-md hover:shadow-lg ${
                  isAddingToCart ? 'bg-gradient-to-r from-green-500 to-green-600' : ''
                }`}
              >
                {cartLoading ? (
                  <>
                    {isAddingToCart ? (
                      <>
                        <svg className="animate-checkmark h-5 w-5 mr-2" viewBox="0 0 52 52">
                          <path className="animate-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="white" strokeWidth="4"/>
                        </svg>
                        Added!
                      </>
                    ) : (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="mr-2 sm:mr-3" />
                    Add to Cart - ETB {(item.price * quantity).toFixed(2)}
                  </>
                )}
              </button>

              <div className="mt-4 sm:mt-6 flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-200">
                <span className="text-gray-700 font-medium text-base sm:text-lg">Total:</span>
                <span className="text-xl sm:text-2xl font-bold text-red-600">
                  ETB {(item.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-6 sm:mb-8">
            <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <FaRegComment className="text-red-600 text-lg sm:text-xl" />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Customer Reviews</h3>
          </div>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 sm:h-12 w-10 sm:w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-base sm:text-lg">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-1 sm:p-2 rounded-full mr-2 sm:mr-3">
                        <FaUser className="text-gray-500 text-sm sm:text-base" />
                      </div>
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{review.user.username}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(review.posted_on).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base pl-8 sm:pl-11">{review.review}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Review Form */}
          <form onSubmit={handleSubmitReview} className="mt-8 sm:mt-12 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Share Your Experience</h4>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was your experience with this item? Share your thoughts..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
              rows="4"
              required
              aria-label="Your review"
            />
            <button
              type="submit"
              disabled={reviewLoading || !reviewText.trim()}
              className="mt-4 sm:mt-6 bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 disabled:bg-red-400 font-medium text-base sm:text-lg shadow-md hover:shadow-lg"
            >
              {reviewLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        </div>

        {/* Created By */}
        {item.created_by && (
          <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 text-xs sm:text-sm text-gray-500 bg-gray-50">
            <span className="font-medium">Added by:</span> {item.created_by.username}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;


