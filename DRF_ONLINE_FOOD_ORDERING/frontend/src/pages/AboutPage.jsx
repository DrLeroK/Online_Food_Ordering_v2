import React from 'react';
import { FaHamburger, FaLeaf, FaAward, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-red-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Crafting delicious burgers with passion since 2010
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Our Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">About Atlas Burgers</h2>
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <p className="text-gray-700 mb-4">
              Founded in 2010, Atlas Burgers began as a small food truck with a big dream: to serve the most 
              delicious, high-quality burgers in town. What started as a humble operation has now grown into 
              one of the most beloved burger joints in the region.
            </p>
            <p className="text-gray-700 mb-4">
              Our name "Atlas" represents our commitment to sourcing the best ingredients from around the 
              world while staying grounded in our local community values.
            </p>
            <p className="text-gray-700">
              Every burger we serve is made with care, from our freshly baked buns to our hand-formed patties 
              and house-made sauces. We believe in quality, consistency, and most importantly, flavor.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quality Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <FaHamburger className="text-4xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Quality</h3>
              <p className="text-gray-700">
                We use only the freshest ingredients and never compromise on quality.
              </p>
            </div>

            {/* Sustainability Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <FaLeaf className="text-4xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sustainability</h3>
              <p className="text-gray-700">
                Committed to eco-friendly practices and supporting local producers.
              </p>
            </div>

            {/* Excellence Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="flex justify-center mb-4">
                <FaAward className="text-4xl text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Culinary Excellence</h3>
              <p className="text-gray-700">
                Our chefs craft each burger with skill, creativity, and passion.
              </p>
            </div>
          </div>
        </div>

        {/* Visit Us Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Visit Us</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              
              {/* Contact Info */}
              <div className="md:w-1/2 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    Location
                  </h3>
                  <p className="text-gray-700">123 Burger Street</p>
                  <p className="text-gray-700">Foodie City, FC 12345</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaClock className="mr-2 text-red-600" />
                    Hours
                  </h3>
                  <p className="text-gray-700">Monday - Friday: 11AM - 10PM</p>
                  <p className="text-gray-700">Saturday - Sunday: 10AM - 11PM</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaPhone className="mr-2 text-red-600" />
                    Contact
                  </h3>
                  <p className="text-gray-700 mb-2">(555) 123-4567</p>
                  <p className="text-gray-700 flex items-center">
                    <FaEnvelope className="mr-2 text-red-600" />
                    info@atlasburgers.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default AboutPage;