
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={`
        w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
        text-gray-200 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-colors
        resize-y
        ${className}
      `}
      {...props}
    ></textarea>
  );
};

export default Textarea;
