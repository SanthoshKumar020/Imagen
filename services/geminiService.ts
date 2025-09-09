// Fix: Import GoogleGenAI according to guidelines
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// --- Error Handling ---

const isQuotaError = (error: unknown): boolean => {
    const apiError = (error as any)?.error;
    if (apiError && typeof apiError === 'object') {
        return apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429;
    }
    return false;
};

const parseGeminiError = (error: unknown): string => {
    const apiError = (error as any)?.error;
    const errorMessage = apiError?.message || '';

    // Check for the specific billing error first
    if (typeof errorMessage === 'string' && errorMessage.includes("only accessible to billed users")) {
        return "This action requires a premium API. To use it, please enable billing on your Google Cloud project and use a new API key from that project in the settings.";
    }

    if (isQuotaError(error)) {
        return "API quota exceeded. Please check your plan and billing details, or try again in a few moments.";
    }
    
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

export const createGroupPhoto = async (images: { base64: string, mimeType: string }[], apiKey: string): Promise<string> => {
    try {
        if (images.length < 2) {
            throw new Error("Group photo creation requires at least 2 images.");
        }
        const ai = getClient(apiKey);
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const prompt = `**URGENT AI MISSION: GROUP PHOTO SYNTHESIS**
You have been provided with ${images.length} images, each potentially of a different person. Your task is to create a single, new, cohesive, and hyper-realistic group photograph that includes **every single person** from the provided images.
**CRITICAL RULES:**
1.  **PRESERVE IDENTITY:** It is absolutely crucial that you maintain the exact facial features and identity of each individual from their respective source image. Do not alter their appearance.
2.  **COHESIVE SCENE:** Place all individuals in a plausible shared environment (e.g., an outdoor park, a modern office lounge, a celebratory event). The lighting, shadows, and perspective must be consistent for everyone.
3.  **NATURAL POSES:** Arrange the people in natural, interacting poses suitable for a group photo. Avoid stiff, copy-pasted appearances.
4.  **PHOTOREALISM:** The final image must be indistinguishable from a real photograph. Pay extreme attention to skin texture, lighting, and details.
5.  **OUTPUT IMAGE ONLY:** Your output must only be the final generated image. Do not include any text.`;


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

        throw new Error("Group photo creation failed to return an image.");

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