
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

    // Check for specific, user-friendly messages first
    if (typeof errorMessage === 'string') {
        if (errorMessage.includes("API key not valid")) {
            return "The provided API key is invalid. Please check the key and try again.";
        }
        if (errorMessage.includes("only accessible to billed users")) {
            return "This action requires a premium API. To use it, please enable billing on your Google Cloud project and use a new API key from that project in the settings.";
        }
    }

    if (isQuotaError(error)) {
        return "You've exceeded the free tier quota for your API key. To continue, please enable billing on your Google Cloud project associated with this key. This will grant you higher usage limits.";
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

export const validateApiKey = async (apiKey: string): Promise<{isValid: boolean; error?: string}> => {
    try {
        const ai = getClient(apiKey);
        // A very simple, fast request to check if the key is valid and has permissions.
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "test",
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: parseGeminiError(error) };
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

        const prompt = `**CRITICAL MISSION: FLAWLESS, IDENTICAL-FACE GROUP PHOTO COMPOSITE**
You are a precision tool for photorealistic image composition. You have been provided with ${images.length} separate images, each featuring one person. Your **only** task is to create a single, unified group photograph that places every person into a realistic, shared scene.

**ABSOLUTE DIRECTIVE #1: ZERO FACIAL ALTERATION.**
This is not a creative task. It is a technical reconstruction. The facial identity of each person is SACROSANCT.
-   **DO NOT** change, alter, modify, blend, interpret, or 'enhance' any facial features. The goal is 100% IDENTICAL replication of each person's face from their source image.
-   **CLONE, DO NOT CREATE.** Treat the faces as immutable data to be perfectly copied and placed.
-   Scrutinize and replicate every detail: eye shape, nose bridge, jawline, skin texture, moles, freckles, and expression.
-   The final image's success is judged SOLELY on whether each person is instantly and perfectly recognizable. Any deviation is a total failure.

**SCENE & TECHNICAL GUIDELINES:**
1.  **Unified Scene:** Place all individuals into a single, plausible environment (e.g., a professionally lit studio, a scenic outdoor location, a modern interior).
2.  **Coherent Lighting:** The lighting must be consistent across all subjects and match the environment. Shadows and highlights must be uniform and realistic.
3.  **Natural Posing:** Arrange the individuals in a natural group composition. They must look like they are physically present in the same space together. Avoid a 'copy-paste' appearance.
4.  **Photorealism:** The final composite must be indistinguishable from a real photograph. Ensure realistic skin textures, hair details, and clothing.

**OUTPUT:**
-   Produce the final image ONLY.
-   No text, no descriptions, no apologies. Just the photorealistic group composite.`;


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

export const generateVideo = async (
    prompt: string, 
    image: { base64: string, mimeType: string } | null,
    apiKey: string,
    onProgress: (message: string) => void
): Promise<string> => {
    try {
        const ai = getClient(apiKey);
        onProgress("Initializing video request...");

        const videoRequest: any = {
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: { numberOfVideos: 1 }
        };

        if (image) {
            videoRequest.image = {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            };
            const consistencyPrompt = `**CRITICAL DIRECTIVE: ABSOLUTE IDENTITY PRESERVATION.**
The provided image contains the subject for this video. Your task is to animate this **EXACT PERSON**.
- **FACE:** The facial structure, features, skin tone, and identity MUST remain identical to the reference image. This is a technical replication, not a creative interpretation. Any deviation in the face is a failure.
- **CONTEXT:** The user's prompt below describes the scene, action, and mood for this person. Adhere to it while maintaining the subject's unwavering identity.
---
User Prompt: "${prompt}"`;
            videoRequest.prompt = consistencyPrompt;
        }
        
        let operation = await ai.models.generateVideos(videoRequest);
        onProgress("AI is warming up...");

        const progressInterval = 10000; // 10 seconds
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, progressInterval));
            onProgress("Checking on your video's progress...");
            try {
                operation = await ai.operations.getVideosOperation({ operation: operation });
            } catch (pollError) {
                console.warn("Polling failed, but will retry.", pollError);
                onProgress("Connection hiccup, retrying...");
            }
        }
        onProgress("Finalizing video render...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }

        onProgress("Downloading video...");
        const response = await fetch(`${downloadLink}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`Failed to download the generated video. Status: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                onProgress("Video ready!");
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(videoBlob);
        });

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