import React from 'react';

const NotFound = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="text-center max-w-md">
        {/* Large 404 Header styling */}
        <h1 className="text-9xl font-extrabold text-indigo-500 tracking-widest animate-bounce">
          404
        </h1>
        
        <div className="bg-indigo-600 text-xs px-2 py-1 rounded rotate-12 absolute transform -translate-y-20 translate-x-28 inline-block font-bold uppercase">
          Page Not Found
        </div>

        <h2 className="text-3xl font-bold md:text-4xl mt-4 mb-2">
          Lost in Space?
        </h2>
        
        <p className="text-gray-400 mb-8 text-sm md:text-base">
          The page you are looking for doesn't exist or has been moved to a secure directory.
        </p>

        {/* Dynamic button redirection link */}
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-block px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;