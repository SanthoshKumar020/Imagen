
import React, { useState, useRef } from 'react';
import { CharacterProfile, GenerationState, CanonImage } from '../types';
import Card from './ui/Card';
import Label from './ui/Label';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
// Fix: Import from geminiService instead of the legacy pollinationsService.
import { generateCanonicalImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface CharacterProfileFormProps {
  profile: CharacterProfile;
  setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

const CharacterProfileForm: React.FC<CharacterProfileFormProps> = ({ profile, setProfile }) => {
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle', message: '' });
  const isLoading = generationState.status === 'loading';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
  };

  const handleGenerateAvatar = async () => {
    setGenerationState({ status: 'loading', message: 'Generating avatar...' });
    try {
      const imageUrl = await generateCanonicalImage(profile.name);
      const newAvatar: CanonImage = {
        id: `avatar-${Date.now()}`,
        name: 'AI Avatar',
        base64: imageUrl.split(',')[1], // Assuming data URL
        url: imageUrl,
      };
      setProfile(prev => ({ ...prev, aiModelImage: newAvatar }));
      setGenerationState({ status: 'idle', message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate avatar.';
      setGenerationState({ status: 'error', message });
    }
  };

  const removeAvatar = () => {
    setProfile(prev => ({ ...prev, aiModelImage: null }));
  };
  
  const removeCanonImage = (id: string) => {
    setProfile(prev => ({
        ...prev,
        canonImages: prev.canonImages.filter(img => img.id !== id)
    }));
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              const newImage: CanonImage = {
                  id: `canon-upload-${Date.now()}`,
                  name: file.name,
                  base64: result.split(',')[1],
                  url: result,
              };
              setProfile(prev => ({ ...prev, canonImages: [...prev.canonImages, newImage] }));
          };
          reader.readAsDataURL(file);
      }
      // Reset file input to allow uploading the same file again
      e.target.value = '';
  };

  return (
    <Card title="Character Profile">
      <div className="space-y-6">
        <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" value={profile.age} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Input id="ethnicity" name="ethnicity" value={profile.ethnicity} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="persona">Persona</Label>
              <Textarea id="persona" name="persona" value={profile.persona} onChange={handleChange} rows={3} />
            </div>
             <div>
              <Label htmlFor="description">Physical Description</Label>
              <Textarea id="description" name="description" value={profile.description} onChange={handleChange} rows={4} />
              <p className="text-xs text-gray-500 mt-1">Used to generate the AI Avatar and maintain consistency.</p>
            </div>
        </div>

        <div>
            <h3 className="text-md font-semibold text-gray-200 mb-2">AI Avatar</h3>
            <p className="text-xs text-gray-500 mb-3">The persistent, canonical model for your influencer.</p>
            {profile.aiModelImage ? (
                <div className="relative group">
                    <img src={profile.aiModelImage.url} alt="AI Avatar" className="rounded-lg w-full aspect-[3/4] object-cover" />
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button onClick={handleGenerateAvatar} disabled={isLoading}>
                            {isLoading ? <LoadingSpinner /> : 'Regenerate'}
                        </Button>
                        <Button onClick={removeAvatar} className="bg-red-600 hover:bg-red-500">
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="text-gray-400 mb-4">No AI Avatar generated yet.</p>
                    <Button onClick={handleGenerateAvatar} disabled={isLoading} className="w-full">
                        {isLoading ? <LoadingSpinner message={generationState.message} /> : 'Generate Avatar'}
                    </Button>
                </div>
            )}
        </div>

        <div>
            <h3 className="text-md font-semibold text-gray-200 mb-2">Additional Reference Images</h3>
            <p className="text-xs text-gray-500 mb-3">Upload your own images for style or content references.</p>
            {profile.canonImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {profile.canonImages.map(image => (
                        <div key={image.id} className="relative group">
                            <img src={image.url} alt={image.name} className="rounded-md aspect-square object-cover" />
                            <button 
                                onClick={() => removeCanonImage(image.id)}
                                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <Button onClick={handleUploadClick} disabled={isLoading} className="w-full bg-gray-600 hover:bg-gray-500">
                Upload Image
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
                accept="image/png, image/jpeg"
            />
        </div>
        
        {generationState.status === 'error' && (
          <p className="mt-2 text-sm text-red-400 text-center">{generationState.message}</p>
        )}
      </div>
    </Card>
  );
};

export default CharacterProfileForm;
