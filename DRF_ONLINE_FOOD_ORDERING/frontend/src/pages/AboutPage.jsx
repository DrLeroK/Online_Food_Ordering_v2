import React from 'react';
import { FaHamburger, FaLeaf, FaAward } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            OUR <span className="text-red-600">STORY</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Crafting legendary burgers with passion since 2010
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* Our Story Section */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
            <div className="lg:w-1/2 relative">
              <div className="relative group">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5" 
                  alt="Atlas Burgers founder" 
                  className="rounded-2xl w-full h-auto shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-2xl shadow-xl transform group-hover:rotate-6 transition-transform duration-300">
                  <span className="block text-4xl font-bold">2010</span>
                  <span className="text-sm">Founded</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                THE <span className="text-red-600">ATLAS</span> JOURNEY
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                What began as a single burger stand has grown into a beloved local institution. Our founder, Chef Michael Atlas, started with a simple mission: to create the perfect burger using only the finest ingredients.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                The name "Atlas" represents our commitment to exploring global flavors while staying rooted in our community. We source locally whenever possible, but we're not afraid to import exceptional ingredients from around the world.
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Today, we continue that tradition by hand-selecting every ingredient, perfecting our recipes, and serving each customer like family.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              OUR <span className="text-red-600">VALUES</span>
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Quality Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-center">
                <FaHamburger className="text-4xl text-red-600 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality First</h3>
                <p className="text-gray-600">We never compromise on ingredients. Our beef is always fresh, never frozen, and sourced from trusted local farms.</p>
              </div>
            </div>

            {/* Sustainability Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-center">
                <FaLeaf className="text-4xl text-red-600 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability</h3>
                <p className="text-gray-600">We're committed to eco-friendly practices, from compostable packaging to energy-efficient kitchens.</p>
              </div>
            </div>

            {/* Excellence Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-center">
                <FaAward className="text-4xl text-red-600 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">Our award-winning chefs bring creativity and precision to every burger we serve.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;






// UPDATED PAGE NEEDS TO BE ADDED