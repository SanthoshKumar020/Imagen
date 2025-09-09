import React, { useState, useRef } from 'react';
import { CharacterProfile, CanonImage } from '../types';
import Card from './ui/Card';
import Label from './ui/Label';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import { useApiKey } from '../contexts/ApiKeyContext';
import { createGroupPhoto } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface CharacterProfileFormProps {
  profile: CharacterProfile;
  setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

const CharacterProfileForm: React.FC<CharacterProfileFormProps> = ({ profile, setProfile }) => {
  const { apiKey } = useApiKey();
  const canonFileInputRef = useRef<HTMLInputElement>(null);
  const groupPhotoFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  
  const [groupImages, setGroupImages] = useState<CanonImage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [groupError, setGroupError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
  };
  
  const removeAvatar = () => {
    setProfile(prev => ({ ...prev, aiModelImage: null }));
  };

  const handleAvatarUploadClick = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const newAvatar: CanonImage = {
                id: `avatar-upload-${Date.now()}`,
                name: file.name,
                base64: result.split(',')[1],
                url: result,
            };
            setProfile(prev => ({ ...prev, aiModelImage: newAvatar }));
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleGroupPhotoUploadClick = () => {
    groupPhotoFileInputRef.current?.click();
  };

  const handleGroupPhotoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
          const newImages: CanonImage[] = [];
          const remainingSlots = 10 - groupImages.length;
          const filesToProcess = Array.from(files).slice(0, remainingSlots);

          filesToProcess.forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  const result = reader.result as string;
                  const newImage: CanonImage = {
                      id: `group-upload-${Date.now()}-${file.name}`,
                      name: file.name,
                      base64: result.split(',')[1],
                      url: result,
                  };
                  newImages.push(newImage);
                  if (newImages.length === filesToProcess.length) {
                      setGroupImages(prev => [...prev, ...newImages]);
                  }
              };
              reader.readAsDataURL(file);
          });
      }
      e.target.value = '';
  };

  const removeGroupImage = (id: string) => {
    setGroupImages(prev => prev.filter(img => img.id !== id));
  };

  const handleCreateGroupPhoto = async () => {
    if (!apiKey || groupImages.length < 2) {
        setGroupError("Please upload 2-10 images to create a group photo.");
        return;
    }
    setIsCreating(true);
    setGroupError('');
    try {
        const imagePayload = groupImages.map(img => ({
            base64: img.base64,
            mimeType: img.url.match(/:(.*?);/)?.[1] || 'image/jpeg'
        }));
        
        const groupImageUrl = await createGroupPhoto(imagePayload, apiKey);
        
        const newGroupImage: CanonImage = {
            id: `group-photo-${Date.now()}`,
            name: 'Group Photo',
            base64: groupImageUrl.split(',')[1],
            url: groupImageUrl,
        };

        setProfile(prev => ({ ...prev, canonImages: [...prev.canonImages, newGroupImage] }));
        setGroupImages([]);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create group photo.';
        setGroupError(message);
    } finally {
        setIsCreating(false);
    }
  };
  
  const removeCanonImage = (id: string) => {
    setProfile(prev => ({
        ...prev,
        canonImages: prev.canonImages.filter(img => img.id !== id)
    }));
  }

  const handleCanonUploadClick = () => {
    canonFileInputRef.current?.click();
  };

  const handleCanonFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              <p className="text-xs text-gray-500 mt-1">Used to maintain consistency in image editing.</p>
            </div>
        </div>

        <div>
            <h3 className="text-md font-semibold text-gray-200 mb-2">Primary Character Image</h3>
             <p className="text-xs text-gray-500 mb-3">The main image for your influencer. This is required for editing.</p>
            {profile.aiModelImage ? (
                <div className="relative group">
                    <img src={profile.aiModelImage.url} alt="AI Avatar" className="rounded-lg w-full aspect-[3/4] object-cover" />
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button onClick={handleAvatarUploadClick}>
                            Replace
                        </Button>
                        <Button onClick={removeAvatar} className="bg-red-600 hover:bg-red-500">
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <Button onClick={handleAvatarUploadClick} className="w-full bg-gray-600 hover:bg-gray-500">
                    Upload Primary Image
                </Button>
            )}
        </div>
        
        <div className="space-y-4 p-4 border border-dashed border-gray-600 rounded-lg bg-gray-800/30">
          <h3 className="text-md font-semibold text-blue-300">Group Photo Creator</h3>
          <p className="text-xs text-gray-400">Upload 2-10 photos of different people to create a single group photo.</p>
          
          {groupImages.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {groupImages.map(img => (
                <div key={img.id} className="relative group aspect-square">
                  <img src={img.url} alt={img.name} className="rounded-md w-full h-full object-cover" />
                  <button 
                    onClick={() => removeGroupImage(img.id)}
                    className="absolute -top-1 -right-1 bg-red-600/90 hover:bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={handleGroupPhotoUploadClick} className="w-full bg-gray-600 hover:bg-gray-500 text-sm" disabled={groupImages.length >= 10}>
              Upload Photos ({groupImages.length}/10)
            </Button>
            <Button onClick={handleCreateGroupPhoto} className="w-full text-sm" disabled={isCreating || groupImages.length < 2}>
              {isCreating ? <LoadingSpinner message="Creating..." /> : 'Create Group Photo'}
            </Button>
          </div>
          {groupError && <p className="text-xs text-center text-red-400 mt-2">{groupError}</p>}
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
            <Button onClick={handleCanonUploadClick} className="w-full bg-gray-600 hover:bg-gray-500">
                Upload Image
            </Button>
             <input
                type="file"
                ref={groupPhotoFileInputRef}
                onChange={handleGroupPhotoFileSelected}
                className="hidden"
                accept="image/png, image/jpeg"
                multiple
            />
            <input
                type="file"
                ref={canonFileInputRef}
                onChange={handleCanonFileSelected}
                className="hidden"
                accept="image/png, image/jpeg"
            />
            <input
                type="file"
                ref={avatarFileInputRef}
                onChange={handleAvatarFileSelected}
                className="hidden"
                accept="image/png, image/jpeg"
            />
        </div>
        
      </div>
    </Card>
  );
};

export default CharacterProfileForm;