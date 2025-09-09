import React from 'react';

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange, disabled = false }) => {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
          enabled ? 'bg-blue-600' : 'bg-gray-600'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        aria-pressed={enabled}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
