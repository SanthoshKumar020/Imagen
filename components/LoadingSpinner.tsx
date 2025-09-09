
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      {message && <span>{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
