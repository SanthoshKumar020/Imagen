
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          AI Influencer <span className="text-blue-400">Studio</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
