import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-xl">
        
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Text */}
        <p className="text-gray-700 font-medium tracking-wide animate-pulse">
          Please wait...
        </p>

      </div> 

    </div>
  );
};

export default Loading;