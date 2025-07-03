import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaMotorcycle } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            <span className="text-red-600">CONTACT</span> US
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Find us, call us, or get your favorite burgers delivered
          </p>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              OUR <span className="text-red-600">LOCATIONS</span>
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visit us at either of our two locations or enjoy Atlas Burgers delivered to your door
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {/* Downtown Location */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="h-48 bg-red-600 flex items-center justify-center">
                <FaMapMarkerAlt className="text-6xl text-white opacity-80" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Downtown</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">123 Burger Avenue, Foodie City</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaPhone className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaClock className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">Mon-Fri: 11AM-10PM<br/>Sat-Sun: 10AM-11PM</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaMotorcycle className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">Delivery available via our app</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uptown Location */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="h-48 bg-gray-900 flex items-center justify-center">
                <FaMapMarkerAlt className="text-6xl text-white opacity-80" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Uptown</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">456 Patty Plaza, Foodie City</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaPhone className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">(555) 987-6543</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaClock className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">Mon-Fri: 11AM-10PM<br/>Sat-Sun: 10AM-11PM</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaMotorcycle className="text-xl text-red-600 mt-1" />
                    <p className="text-gray-600">Delivery available via our app</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Info Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex justify-center">
                <div className="bg-red-100 p-6 rounded-full">
                  <FaMotorcycle className="text-6xl text-red-600" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <span className="text-red-600">DELIVERY</span> SERVICE
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Can't make it to our locations? No problem! We deliver within a 5-mile radius of both our Downtown and Uptown locations.
                </p>
                <p className="text-gray-600 text-lg">
                  Download our app or call your nearest location to place a delivery order. Delivery hours match our regular business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;





// UPDATED PAGE NEEDS TO BE ADDED