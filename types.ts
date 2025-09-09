
export interface CharacterProfile {
  name: string;
  age: number;
  ethnicity: string;
  persona: string;
  description: string;
  aiModelImage: CanonImage | null;
  canonImages: CanonImage[];
}

export interface CanonImage {
  id: string;
  name: string;
  base64: string;
  url: string;
}

export enum AssetType {
  Image = 'image',
}

export interface GeneratedAsset {
  id:string;
  type: AssetType;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'error';
  message: string;
}

export interface PromptModifier {
  id: string;
  category: 'Outfit' | 'Hairstyle' | 'Makeup' | 'Background' | 'Other';
  description: string;
}