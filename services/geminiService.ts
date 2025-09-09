// Fix: Import GoogleGenAI according to guidelines
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { CANONICAL_PROMPT } from "../constants";

// --- Error Handling ---

const isQuotaError = (error: unknown): boolean => {
    const apiError = (error as any)?.error;
    if (apiError && typeof apiError === 'object') {
        return apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429;
    }
    return false;
};

const parseGeminiError = (error: unknown): string => {
    if (isQuotaError(error)) {
        return "API quota exceeded. Please check your plan and billing details, or try again in a few moments.";
    }
    const apiError = (error as any)?.error;
    if (apiError && apiError.message) {
        return apiError.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred during the request.';
};

// --- Client Factory ---
const getClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API key is missing. Please provide a key in the settings.");
    }
    return new GoogleGenAI({ apiKey });
};


// --- Service Functions ---

export const generateCanonicalImage = async (profileName: string, apiKey: string): Promise<string> => {
    try {
        const ai = getClient(apiKey);
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: CANONICAL_PROMPT.replace('{name}', profileName),
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '3:4',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No images generated.");
    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};

export const generateStillImage = async (prompt: string, aspectRatio: string, apiKey: string): Promise<string> => {
    try {
        const ai = getClient(apiKey);
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "9:16",
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("Image generation failed to return an image.");
    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};

export const enhancePrompt = async (prompt: string, apiKey: string): Promise<string> => {
    try {
        const ai = getClient(apiKey);
        const systemInstruction = "You are a world-class prompt engineer specializing in hyper-realistic generative AI imagery. Your mission is to elevate a user's prompt into a masterpiece of photographic realism. The final output must be utterly indistinguishable from a professional photograph. Enhance the prompt with extreme detail, focusing on: camera specifics (e.g., Canon EOS R5, 85mm f/1.2L lens), cinematic lighting (e.g., chiaroscuro, Rembrandt lighting), and analog film emulation (e.g., Kodak Portra 400, Fuji Pro 400H). Introduce subtle, organic imperfections like film grain, chromatic aberration, and natural skin texture with visible pores. **YOUR PRIMARY DIRECTIVE IS TO AGGRESSIVELY ELIMINATE THE 'AI LOOK'.** This means destroying any trace of plastic skin, the uncanny valley effect, overly perfect symmetry, dead or vacant eyes, and airbrushed textures. Do not alter the core subject or intent of the user's prompt. Your output must be only the enhanced prompt, ready for the AI.";
        const fullPrompt = `Original prompt: "${prompt}"\n\nEnhanced prompt:`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction,
                temperature: 0.8,
                topP: 0.95,
            }
        });
        return response.text.trim();
    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};

export const editImage = async (prompt: string, images: { base64: string, mimeType: string }[], apiKey: string): Promise<string> => {
    try {
        const ai = getClient(apiKey);
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const contents = {
            parts: [
                ...imageParts,
                { text: prompt },
            ],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("Image editing failed to return an image.");

    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};

export const upscaleImage = async (base64Image: string, apiKey: string): Promise<string> => {
    try {
        const prompt = `URGENT: Upscale this image to a much higher resolution. Enhance all details, textures, and sharpness for maximum clarity and photorealism. **Crucially, you must not change the character's face, pose, clothing, or the background composition.** The output must be a higher-resolution, sharper version of the original input, maintaining the aspect ratio perfectly.`;
        
        const imagePayload = [{
            base64: base64Image,
            mimeType: 'image/jpeg'
        }];

        return await editImage(prompt, imagePayload, apiKey);

    } catch (error) {
        throw new Error(parseGeminiError(error));
    }
};
