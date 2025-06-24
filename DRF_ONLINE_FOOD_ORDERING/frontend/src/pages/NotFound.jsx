import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Notfound.css"


function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        // Add animation class to elements after component mounts
        const timer = setTimeout(() => {
            document.querySelector('.not-found-container')?.classList.add('animate-in');
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="floating-orb orb-1"></div>
                    <div className="floating-orb orb-2"></div>
                    <div className="floating-orb orb-3"></div>
                </div>

                <div className="not-found-container text-center max-w-4xl relative z-10 opacity-0 transform translate-y-10">
                    <div className="relative inline-block mb-8">
                        <h1 className="text-[10rem] md:text-[15rem] font-bold text-gray-200 mb-0 leading-none">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-block p-6 bg-white rounded-full shadow-xl mb-6 animate-bounce">
                                    <svg className="h-20 w-20 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Lost in Space?</h2>
                                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                    The page you're looking for has been abducted or never existed in this dimension.
                                </p>
                                <div className="mt-8">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="relative inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 group"
                                    >
                                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                        <span className="relative flex items-center">
                                            <svg className="animate-pulse -ml-1 mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Beam Me Home!
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-gray-400 text-sm animate-pulse">
                        <p>Error Code: 404_NOT_FOUND | Status: LOST_IN_SPACE</p>
                    </div>
                </div>
            </main>

        </div>
    );
}

export default NotFound;