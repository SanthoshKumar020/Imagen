import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { validateApiKey } from '../services/geminiService';

type ApiKeyStatus = 'unknown' | 'valid' | 'invalid' | 'checking';

interface ApiKeyContextType {
  apiKey: string;
  setCustomApiKey: (key: string) => void;
  clearCustomApiKey: () => void;
  isCustomKey: boolean;
  apiKeyStatus: ApiKeyStatus;
  validationError: string;
  testAndSetApiKey: (key: string) => Promise<boolean>;
  resetApiKeyStatus: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

// This will be populated by Vercel's environment variables during the build process.
const DEFAULT_API_KEY = process.env.API_KEY || '';

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('unknown');
  const [validationError, setValidationError] = useState('');


  useEffect(() => {
    // On initial load, try to get the key from the user's browser storage.
    try {
      const storedKey = localStorage.getItem('userApiKey');
      if (storedKey) {
        setCustomApiKey(storedKey);
      }
    } catch (e) {
      console.error("Could not access local storage to get API key", e);
    }
    setIsInitialized(true);
  }, []);
  
  const setKey = (key: string) => {
    if (key) {
        try {
            localStorage.setItem('userApiKey', key);
            setCustomApiKey(key);
        } catch (e) {
            console.error("Could not save API key to local storage", e);
            // Optionally, update state to show an error to the user
        }
    }
  };
  
  const clearKey = () => {
    try {
        localStorage.removeItem('userApiKey');
        setCustomApiKey(null);
        setApiKeyStatus('unknown'); // Reset status when clearing
    } catch (e) {
        console.error("Could not remove API key from local storage", e);
    }
  };

  const resetApiKeyStatus = () => {
    setApiKeyStatus('unknown');
    setValidationError('');
  };

  const testAndSetApiKey = async (key: string): Promise<boolean> => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
        clearKey();
        return true; // Clearing the key is a "successful" action
    }

    setApiKeyStatus('checking');
    setValidationError('');

    const { isValid, error } = await validateApiKey(trimmedKey);

    if (isValid) {
        setKey(trimmedKey);
        setApiKeyStatus('valid');
        return true;
    } else {
        setApiKeyStatus('invalid');
        setValidationError(error || 'An unknown validation error occurred.');
        // Do not set the key if it's invalid
        return false;
    }
  };


  const effectiveApiKey = customApiKey ?? DEFAULT_API_KEY;
  const isCustomKey = customApiKey !== null;
  
  // Wait until we've checked local storage before rendering the app
  if (!isInitialized) {
      return null;
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey: effectiveApiKey, setCustomApiKey: setKey, clearCustomApiKey: clearKey, isCustomKey, apiKeyStatus, validationError, testAndSetApiKey, resetApiKeyStatus }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};