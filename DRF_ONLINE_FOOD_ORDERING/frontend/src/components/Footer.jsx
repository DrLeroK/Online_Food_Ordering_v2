import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About Column - Full width on mobile, then normal */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center">
              <FaUtensils className="text-red-600 mr-2 text-2xl" />
              <h3 className="text-2xl font-bold">
                <span className="text-red-600">Atlas</span>
                <span className="text-white">Burgers</span>
              </h3>
            </div>
            <p className="text-gray-300">
              Serving the juiciest burgers in town since 2010. Made with love and premium ingredients.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-red-600 transition-colors duration-300 flex items-center"
                >
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/menu/items" 
                  className="text-gray-300 hover:text-red-600 transition-colors duration-300 flex items-center"
                >
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-red-600 transition-colors duration-300 flex items-center"
                >
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-red-600 transition-colors duration-300 flex items-center"
                >
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column - Full width on small screens */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-red-600 flex-shrink-0" />
                <span className="text-gray-300">123 Burger Street, Foodville, NY 10001</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-red-600 flex-shrink-0" />
                <span className="text-gray-300">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-red-600 flex-shrink-0" />
                <span className="text-gray-300">info@atlasburgers.com</span>
              </li>
            </ul>
            
            <div className="pt-2">
              <h4 className="text-gray-300 font-medium mb-2">Opening Hours</h4>
              <p className="text-gray-400 text-sm">Mon-Fri: 10AM - 10PM</p>
              <p className="text-gray-400 text-sm">Sat-Sun: 11AM - 11PM</p>
            </div>
          </div>
        </div>

        {/* Copyright - Stacked on mobile, row on larger screens */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} Atlas Burgers. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-gray-400 hover:text-red-600 text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-red-600 text-sm transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




// UPDATED PAGE NEED TO BE INSERTED TO THE MAIN ONE