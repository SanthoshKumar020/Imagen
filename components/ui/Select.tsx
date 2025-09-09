import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      className={`
        w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
        text-gray-200 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-colors
        ${className}
      `}
      {...props}
    >
        {children}
    </select>
  );
};

export default Select;
