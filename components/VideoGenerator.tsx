
import React, { useState, useRef, useEffect } from 'react';
import { CharacterProfile, GeneratedAsset, AssetType, GenerationState, CanonImage } from '../types';
import { generateVideo } from '../services/geminiService';
import { useApiKey } from '../contexts/ApiKeyContext';
import Card from './ui/Card';
import Label from './ui/Label';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import LoadingSpinner from './LoadingSpinner';
import VoiceInputButton from './ui/VoiceInputButton';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const LOADING_MESSAGES = [
    "Contacting the video creation AI...",
    "Analyzing your creative prompt...",
    "Allocating high-performance GPUs...",
    "Warming up the rendering engine...",
    "Storyboarding the first few frames...",
    "This can take a few minutes, hang tight!",
    "Generating initial motion vectors...",
    "Rendering frames... this is the long part.",
    "Checking for visual consistency...",
    "Adding cinematic touches...",
    "Almost there, finalizing the video file...",
];

interface VideoGeneratorProps {
  profile: CharacterProfile;
  addAsset: (asset: GeneratedAsset) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ profile, addAsset }) => {
  const { apiKey } = useApiKey();
  const [prompt, setPrompt] = useState('A cinematic, 4k, ultra-realistic video of {name} smiling at the camera, golden hour lighting.');
  const [referenceImage, setReferenceImage] = useState<CanonImage | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle', message: '' });
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setPrompt(prev => prev.replace(/{name}/g, profile.name || 'the character'));
  }, [profile.name]);

  useEffect(() => {
      let messageInterval: NodeJS.Timeout;
      if (generationState.status === 'loading') {
          let messageIndex = 0;
          setProgressMessage(LOADING_MESSAGES[messageIndex]);
          messageInterval = setInterval(() => {
              messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
              setProgressMessage(LOADING_MESSAGES[messageIndex]);
          }, 5000);
      }
      return () => clearInterval(messageInterval);
  }, [generationState.status]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              setReferenceImage({
                  id: `vid-ref-${Date.now()}`,
                  name: file.name,
                  url: result,
                  base64: result.split(',')[1],
              });
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };
  
  const handleGenerateVideo = async () => {
    if (!apiKey) {
      setGenerationState({ status: 'error', message: 'API Key is missing. Please add one in settings.' });
      return;
    }
    if (!prompt.trim()) {
      setGenerationState({ status: 'error', message: 'Please enter a prompt to generate a video.' });
      return;
    }

    setGenerationState({ status: 'loading', message: '' });
    
    try {
        const imagePayload = referenceImage ? {
            base64: referenceImage.base64,
            mimeType: referenceImage.url.match(/:(.*?);/)?.[1] || 'image/jpeg'
        } : null;

        const videoUrl = await generateVideo(prompt, imagePayload, apiKey, (message) => {
            setGenerationState(prev => ({ ...prev, message }));
        });

        const newAsset: GeneratedAsset = {
            id: `vid-${Date.now()}`,
            type: AssetType.Video,
            url: videoUrl,
            prompt: prompt,
            createdAt: new Date().toISOString(),
        };

        addAsset(newAsset);
        setGenerationState({ status: 'idle', message: '' });

    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred during video generation.";
        setGenerationState({ status: 'error', message });
    }
  };
  
  const handleTranscript = (transcript: string) => {
    setPrompt(prev => (prev.endsWith(' ') ? prev : prev + ' ') + transcript);
  };
  
  const isLoading = generationState.status === 'loading';

  return (
    <Card title="Video Generation">
      <div className="space-y-4">
        <div>
          <Label htmlFor="video-prompt">Prompt</Label>
          <div className="relative">
            <Textarea id="video-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="pr-10" />
            <VoiceInputButton onTranscript={handleTranscript} disabled={isLoading} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Describe the scene and action for your video.</p>
        </div>
        
        <div>
            <Label>Optional Reference Image</Label>
            {referenceImage ? (
                <div className="relative group aspect-video">
                    <img src={referenceImage.url} alt="Video Reference" className="w-full h-full object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button onClick={() => fileInputRef.current?.click()} className="text-sm">Replace</Button>
                        <Button onClick={() => setReferenceImage(null)} className="bg-red-600 hover:bg-red-500 text-sm">Remove</Button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-center py-6 px-4 text-sm text-gray-400 hover:text-white bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors"
                >
                    <UploadIcon className="mx-auto mb-2" />
                    Upload Image to Guide Video
                </button>
            )}
        </div>
        <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/png, image/jpeg"
        />

        <div className="pt-2">
            <Button
                onClick={handleGenerateVideo}
                disabled={isLoading || !apiKey || !prompt.trim()}
                className="w-full"
            >
                {isLoading ? <LoadingSpinner message="Generating Video..." /> : 'Generate Video'}
            </Button>
        </div>

        {isLoading && (
            <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-blue-300 font-semibold">This may take several minutes...</p>
                <p className="text-xs text-gray-300 mt-1 animate-pulse">{generationState.message || progressMessage}</p>
            </div>
        )}
        {generationState.status === 'error' && (
            <p className="mt-2 text-sm text-red-400 text-center">{generationState.message}</p>
        )}
      </div>
    </Card>
  );
};

export default VideoGenerator;