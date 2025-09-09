
export const CANONICAL_PROMPT = `
RAW photo, 3:4 aspect ratio, ultra-realistic portrait of a fictional influencer named "{name}". Age 22. Head-and-shoulders view. Oval face, medium-brown skin with authentic, natural texture, visible pores, and subtle imperfections, short wavy black hair with individual strands and flyaways visible, warm hazel-brown eyes with detailed irises and natural reflections (catchlights). Subtle confident smile showing slight teeth texture. Photographed with a Canon EOS R5, 85mm f/1.2 lens. Lighting: soft, diffused natural window light from the side, creating gentle, realistic shadows to define facial features (chiaroscuro). Background is a simple, out-of-focus neutral gray wall. Look is natural, no heavy makeup. Extremely detailed, sharp focus on the eyes, 8k resolution, cinematic film grain, subtle chromatic aberration on edges. --no cartoon, 3d, cgi, illustration, anime, painting, art, airbrushed, smooth skin, plastic look, doll, render.
`;

export const DEFAULT_IMAGE_PROMPT = `Candid, photorealistic photograph of {name}. Expression: authentic, cheerful smile. Pose: looking slightly off-camera, caught in a natural, unposed moment. Environment: luxury beachfront resort terrace, beautiful soft bokeh from the ocean and palm trees in the background. Lighting: warm, dramatic golden hour side-lighting casting long, soft shadows. Outfit: crisp white linen shirt with realistic fabric texture and wrinkles, slightly unbuttoned. Captured on a Sony A7R IV with a 85mm GM lens, f/1.4 aperture for extremely shallow depth of field. Film-like color grading (emulating Kodak Portra 400), ultra-detailed, sharp focus, realistic skin texture with subsurface scattering.`;

// Fix: Added video-specific prompts for the video generator component.
export const DEFAULT_VIDEO_PROMPT = `A short, cinematic, 4k, photorealistic video of {name}. Pose: looking directly at the camera with a subtle, confident expression. Environment: a minimalist, high-end apartment with soft, natural light coming from a large window. Action: {name} slowly turns their head from side to side, then gives a slight nod. The movement should be smooth and natural. Focus on creating a sense of calm and elegance. The video should have a shallow depth of field, with the background softly blurred.`;

export const REALISM_BOOST_PROMPT = `
Final instructions for extreme photorealism:
- Photography Style: Emulate professional photographers like Annie Leibovitz or Steve McCurry.
- Critical Details: Ensure authentic skin texture with pores, subtle blemishes, and fine hairs (peach fuzz). Eyes must have detailed irises, reflections (catchlights), and natural moisture. Hair must have individual strands and flyaways. Avoid perfect symmetry.
- Lighting: Utilize complex, natural lighting that creates depth and dimension. Avoid flat, uniform lighting.
- Post-Processing: Apply subtle film grain, lens distortion, and chromatic aberration to mimic a real lens.
- **Strict Negative Prompt**: --no cgi, 3d, render, illustration, cartoon, anime, painting, smooth skin, plastic look, airbrushed, oversaturated, doll, art, fake, artificial, perfect symmetry. The image must be indistinguishable from a real photograph taken by a professional.
`;

// Fix: Added video-specific realism boost prompt.
export const VIDEO_REALISM_BOOST_PROMPT = `
Final instructions for extreme video realism:
- Camera & Lens: Emulate an ARRI Alexa Mini LF with a 50mm Signature Prime lens.
- Motion: Movement must be fluid and lifelike, avoiding any robotic or jerky motion. Capture subtle micro-expressions.
- Critical Details: Ensure authentic skin texture, realistic hair movement, and natural eye reflections (catchlights) that move with the light source.
- Lighting: Utilize cinematic three-point lighting to create depth and volume.
- Post-Processing: Apply a subtle cinematic color grade (e.g., teal and orange) and a fine layer of film grain.
- **Strict Negative Prompt**: --no cgi, 3d, render, illustration, cartoon, anime, painting, smooth skin, plastic look, airbrushed, oversaturated, doll, art, fake, artificial, perfect symmetry, jerky motion, uncanny valley. The video must be indistinguishable from a real, professionally shot video.
`;

export const SUPPORTED_ASPECT_RATIOS = ['3:4', '1:1', '4:3', '16:9', '9:16'];
