
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
