import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import Label from './ui/Label';
import Input from './ui/Input';
import Button from './ui/Button';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setCustomApiKey, clearCustomApiKey, isCustomKey } = useApiKey();
  const [localApiKey, setLocalApiKey] = useState('');

  useEffect(() => {
    // When the modal is opened, reflect the currently used custom key.
    if (isCustomKey) {
        setLocalApiKey(apiKey);
    } else {
        setLocalApiKey('');
    }
  }, [isOpen, isCustomKey, apiKey]);
  
  if (!isOpen) return null;

  const handleSave = () => {
    if (localApiKey.trim()) {
      setCustomApiKey(localApiKey.trim());
    }
    onClose();
  };

  const handleClear = () => {
    clearCustomApiKey();
    setLocalApiKey('');
  };

  const currentKeyDisplay = isCustomKey ? `********${apiKey.slice(-4)}` : 'Using Default';

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Close settings"
        >
          <CloseIcon />
        </button>
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
            <div>
                <Label htmlFor="api-key-input">Custom Google AI API Key</Label>
                <Input 
                    id="api-key-input"
                    type="password"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your API key"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Your key is saved in your browser's local storage.
                    Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>.
                </p>
            </div>
            <p className="text-sm text-gray-400">Current Key: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{currentKeyDisplay}</span></p>

            <div className="flex justify-end space-x-2 pt-4">
                {isCustomKey && (
                    <Button onClick={handleClear} className="bg-gray-600 hover:bg-gray-500">
                        Reset to Default
                    </Button>
                )}
                <Button onClick={handleSave}>
                    Save and Close
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
