import React from 'react';
import { FaHamburger, FaLeaf, FaAward, FaHeart, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-50"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-sizzling-burger-on-a-black-background-521-large.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <FaHamburger className="text-red-600 text-5xl animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            <span className="text-red-600">ATLAS</span> BURGERS
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Crafting legendary burgers with premium ingredients since 2010
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/menu/items" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              EXPLORE MENU
            </Link>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
              OUR STORY
            </button>
          </div>
        </div>
        
        {/* Scrolling indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white mt-2 rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* About Section with Floating Cards */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              WHY <span className="text-red-600">ATLAS</span>?
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just another burger joint. We're a culinary experience that celebrates quality, flavor, and passion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Feature Cards */}
            {[
              {
                icon: <FaLeaf className="text-4xl text-red-600 mb-4" />,
                title: "Fresh Ingredients",
                desc: "Locally sourced, never frozen ingredients for maximum flavor"
              },
              {
                icon: <FaHamburger className="text-4xl text-red-600 mb-4" />,
                title: "Handcrafted",
                desc: "Each burger made to order with care and attention"
              },
              {
                icon: <FaAward className="text-4xl text-red-600 mb-4" />,
                title: "Award Winning",
                desc: "Recognized as best burgers in the state 3 years running"
              },
              {
                icon: <FaHeart className="text-4xl text-red-600 mb-4" />,
                title: "Made with Love",
                desc: "Our secret ingredient is passion for great food"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-center">
                  {item.icon}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Our Story Section */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mt-16" id="about">
            <div className="lg:w-1/2 relative">
              <div className="relative group">
                <img 
                  src="https://images.unsplash.com/photo-1603064752734-4c48eff53d05" 
                  alt="Burger preparation" 
                  className="rounded-2xl w-full h-auto shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-2xl shadow-xl transform group-hover:rotate-6 transition-transform duration-300">
                  <span className="block text-4xl font-bold">10+</span>
                  <span className="text-sm">Years Experience</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                OUR <span className="text-red-600">STORY</span>
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                What began as a small food truck with a big dream has now become the most beloved burger destination in the city. Our founder, Chef Michael Atlas, started with a simple philosophy: 
              </p>
              <blockquote className="border-l-4 border-red-600 pl-6 mb-6 italic text-gray-700">
                "A great burger should be an experience, not just a meal."
              </blockquote>
              <p className="text-gray-600 mb-8 text-lg">
                Today, we continue that tradition by hand-selecting every ingredient, perfecting our recipes, and serving each customer like family.
              </p>
              <Link 
                to="/menu/items" 
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
              >
                EXPLORE OUR MENU <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              WHAT OUR <span className="text-red-600">CUSTOMERS</span> SAY
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The best burger I've ever had! The Atlas Classic lives up to its name.",
                author: "Sarah J.",
                role: "Food Blogger"
              },
              {
                quote: "Every ingredient tastes fresh and high quality. Worth every penny!",
                author: "Michael T.",
                role: "Regular Customer"
              },
              {
                quote: "Their truffle burger is a game changer. I dream about this burger.",
                author: "David L.",
                role: "Chef & Critic"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl relative shadow-lg"
              >
                <div className="absolute top-0 left-8 transform -translate-y-1/2 bg-red-600 text-white p-3 rounded-full">
                  <FaHeart />
                </div>
                <p className="text-gray-700 italic mb-6 text-lg">"{testimonial.quote}"</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            READY TO EXPERIENCE <span className="text-gray-900">ATLAS BURGERS</span>?
          </h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Visit us today or order online for pickup. Your taste buds will thank you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-red-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              FIND OUR LOCATION
            </button>
            <Link 
              to="/menu/items" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
            >
              ORDER NOW
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;