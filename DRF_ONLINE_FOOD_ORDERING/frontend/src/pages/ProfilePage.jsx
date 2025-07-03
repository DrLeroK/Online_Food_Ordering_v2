import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaCheck, FaTimes, FaLock, FaStar } from 'react-icons/fa';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    score: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/user_management/users/me/');
        setUser(response.data);
        setEditData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          phone_number: response.data.phone_number
        });
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch profile data');
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch('/user_management/update/', editData);
      setUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleChangePassword = () => {
    navigate('/forgot-password');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header - Adjusted for mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-6xl">
              <FaUser />
            </div>
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-yellow-500 text-white rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-xl font-bold">
              {user.score}
              <FaStar className="ml-0.5 sm:ml-1" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 sm:mb-2">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">@{user.username}</p>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          {/* Loyalty Points Banner - Adjusted padding for mobile */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold">ATLAS REWARDS</h2>
                <p className="opacity-90 text-sm sm:text-base">Your current loyalty points</p>
              </div>
              <div className="text-2xl sm:text-3xl font-bold flex items-center">
                {user.score} <FaStar className="ml-1 sm:ml-2 text-yellow-300" />
              </div>
            </div>
          </div>

          {/* Profile Details - Adjusted padding and spacing */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm sm:text-base"
                >
                  <FaEdit className="mr-1 sm:mr-2" /> Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2 sm:space-x-4">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base"
                  >
                    <FaCheck className="mr-1 sm:mr-2" /> Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base"
                  >
                    <FaTimes className="mr-1 sm:mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Email (non-editable) */}
              <div className="border-b border-gray-200 pb-4 sm:pb-6">
                <div className="flex items-center mb-1 sm:mb-2">
                  <FaEnvelope className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">Email Address</h3>
                </div>
                <p className="text-gray-600 ml-7 sm:ml-9 text-sm sm:text-base">{user.email}</p>
              </div>

              {/* First Name */}
              <div className="border-b border-gray-200 pb-4 sm:pb-6">
                <div className="flex items-center mb-1 sm:mb-2">
                  <FaUser className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">First Name</h3>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={editData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent ml-7 sm:ml-9 text-sm sm:text-base"
                  />
                ) : (
                  <p className="text-gray-600 ml-7 sm:ml-9 text-sm sm:text-base">{user.first_name || 'Not provided'}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="border-b border-gray-200 pb-4 sm:pb-6">
                <div className="flex items-center mb-1 sm:mb-2">
                  <FaUser className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">Last Name</h3>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={editData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent ml-7 sm:ml-9 text-sm sm:text-base"
                  />
                ) : (
                  <p className="text-gray-600 ml-7 sm:ml-9 text-sm sm:text-base">{user.last_name || 'Not provided'}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="border-b border-gray-200 pb-4 sm:pb-6">
                <div className="flex items-center mb-1 sm:mb-2">
                  <FaPhone className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">Phone Number</h3>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={editData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent ml-7 sm:ml-9 text-sm sm:text-base"
                    placeholder="+1234567890"
                  />
                ) : (
                  <p className="text-gray-600 ml-7 sm:ml-9 text-sm sm:text-base">{user.phone_number || 'Not provided'}</p>
                )}
              </div>

              {/* Password */}
              <div className="pb-1 sm:pb-2">
                <div className="flex items-center mb-1 sm:mb-2">
                  <FaLock className="text-red-600 mr-2 sm:mr-3 text-lg sm:text-xl" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700">Password</h3>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="ml-7 sm:ml-9 text-red-600 hover:text-red-700 font-medium flex items-center text-sm sm:text-base"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Program Info - Adjusted for mobile */}
        <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">About Atlas Rewards</h2>
          <div className="bg-red-50 border-l-4 border-red-600 p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-gray-700 text-sm sm:text-base">
              Earn <strong>1 point</strong> for every $1 spent. Redeem points for discounts and special offers!
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
            {[
              { points: 100, reward: '$5 OFF your next order' },
              { points: 250, reward: 'Free side with any burger' },
              { points: 500, reward: 'Free Atlas Classic Burger' }
            ].map((tier, index) => (
              <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-1 sm:mb-2">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">{tier.points} Points</h3>
                </div>
                <p className="text-gray-600 ml-8 sm:ml-11 text-xs sm:text-sm">{tier.reward}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;