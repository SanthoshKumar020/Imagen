
export const DEFAULT_IMAGE_PROMPT = `Candid, photorealistic photograph of {name}. Expression: authentic, cheerful smile. Pose: looking slightly off-camera, caught in a natural, unposed moment. Environment: luxury beachfront resort terrace, beautiful soft bokeh from the ocean and palm trees in the background. Lighting: warm, dramatic golden hour side-lighting casting long, soft shadows. Outfit: crisp white linen shirt with realistic fabric texture and wrinkles, slightly unbuttoned. Captured on a Sony A7R IV with a 85mm GM lens, f/1.4 aperture for extremely shallow depth of field. Film-like color grading (emulating Kodak Portra 400), ultra-detailed, sharp focus, realistic skin texture with subsurface scattering.`;

export const REALISM_BOOST_PROMPT = `
Final instructions for extreme photorealism:
- Photography Style: Emulate professional photographers like Annie Leibovitz or Steve McCurry.
- Critical Details: Ensure authentic skin texture with pores, subtle blemishes, and fine hairs (peach fuzz). Eyes must have detailed irises, reflections (catchlights), and natural moisture. Hair must have individual strands and flyaways. Avoid perfect symmetry.
- Lighting: Utilize complex, natural lighting that creates depth and dimension. Avoid flat, uniform lighting.
- Post-Processing: Apply subtle film grain, lens distortion, and chromatic aberration to mimic a real lens.
- **Strict Negative Prompt**: --no cgi, 3d, render, illustration, cartoon, anime, painting, smooth skin, plastic look, airbrushed, oversaturated, doll, art, fake, artificial, perfect symmetry. The image must be indistinguishable from a real photograph taken by a professional.
`;

export const SUPPORTED_ASPECT_RATIOS = ['3:4', '1:1', '4:3', '16:9', '9:16'];