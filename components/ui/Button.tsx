
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md
        hover:bg-blue-500
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
        disabled:bg-gray-600 disabled:cursor-not-allowed
        transition-colors duration-200
        flex items-center justify-center
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
