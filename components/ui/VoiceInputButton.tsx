
import React, { useState, useEffect, useRef } from 'react';

const MicrophoneIcon: React.FC<{isListening: boolean}> = ({ isListening }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={isListening ? 'text-red-400' : 'text-gray-400'}
    >
        {isListening && <circle cx="12" cy="12" r="10" className="animate-pulse opacity-50" fill="currentColor" stroke="none"/>}
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
);

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null); // Using `any` for SpeechRecognition for cross-browser compatibility

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript.trim() + ' ');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech error: ${event.error}`);
        setIsListening(false);
    }

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (disabled || error) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition", e);
        setError("Could not start recognition.");
      }
    }
  };

  const title = error 
    ? error 
    : isListening 
    ? 'Stop dictating' 
    : 'Dictate prompt';

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled || !!error}
      title={title}
      className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-600 disabled:hover:bg-transparent disabled:opacity-50 transition-colors"
      aria-label={title}
    >
      <MicrophoneIcon isListening={isListening} />
    </button>
  );
};

export default VoiceInputButton;
