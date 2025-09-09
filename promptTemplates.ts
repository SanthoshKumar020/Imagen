
export interface PromptTemplate {
  category: 'Fashion' | 'Travel' | 'Lifestyle';
  template: string;
  title: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Fashion
  {
    category: 'Fashion',
    title: 'Street Style Photoshoot',
    template: 'High-fashion street style photo of {name} in downtown Tokyo. Wearing a futuristic avant-garde outfit. Dynamic, mid-stride pose. Rain-slicked streets with neon reflections. Shot on a Sony A7R IV, 35mm f/1.4 GM lens, capturing the vibrant city lights and gritty urban texture. Cinematic, Blade Runner-inspired color grade.'
  },
  {
    category: 'Fashion',
    title: 'Elegant Gala Attire',
    template: 'Full-body portrait of {name} at a glamorous charity gala. Wearing a stunning, floor-length silk gown with intricate beadwork. Posing on a grand staircase with opulent, classic architecture in the background. Lighting is dramatic and cinematic, with soft spotlights highlighting her. Captured with a Canon EOS R5 and an 85mm f/1.2 lens for beautiful background compression.'
  },
  {
    category: 'Fashion',
    title: 'Casual Autumn Look',
    template: '{name} in a cozy, oversized knit sweater and stylish jeans, walking through a park filled with autumn leaves. Candid, joyful expression. The late afternoon sun creates a warm, golden glow. Shallow depth of field blurs the background, emphasizing her relaxed vibe. Her persona is: {persona}.'
  },
  // Travel
  {
    category: 'Travel',
    title: 'Santorini Sunset',
    template: 'Candid shot of {name} watching the sunset in Oia, Santorini. Leaning against a classic white-washed wall, looking out at the Aegean Sea. Wearing a flowing white sundress. The warm, golden hour light illuminates her face. Soft, dreamy bokeh from the distant lights. Captured with a Fuji X-T4, emulating classic Chrome film stock for rich colors.'
  },
  {
    category: 'Travel',
    title: 'Exploring a Moroccan Souk',
    template: 'Vibrant, lively photo of {name} navigating a bustling souk in Marrakech, Morocco. Surrounded by colorful spices, textiles, and lanterns. The lighting is complex, with shafts of light cutting through the covered market. {name} has an expression of wonder and excitement. The photo captures the energy and rich sensory details of the market.'
  },
  {
    category: 'Travel',
    title: 'Jungle Adventure',
    template: 'Action shot of {name} standing near a majestic, misty waterfall in a lush Costa Rican rainforest. Dressed in practical explorer gear. The atmosphere is humid and vibrant, with sunlight filtering through the dense canopy. Water droplets are visible in the air. This image should convey a sense of adventure and connection with nature.'
  },
  // Lifestyle
  {
    category: 'Lifestyle',
    title: 'Cozy Cafe Moment',
    template: 'A cozy, intimate photo of {name} sitting in a charming, rustic cafe with exposed brick walls. She is holding a ceramic mug of latte, with intricate latte art visible. Morning light streams through a large window, creating a warm and inviting atmosphere. shallow depth of field, focus on her relaxed expression. Persona: {persona}.'
  },
  {
    category: 'Lifestyle',
    title: 'Morning Yoga Routine',
    template: '{name} practicing yoga on a balcony overlooking a serene beach at sunrise. She is in a graceful warrior pose. The early morning light is soft and ethereal. The mood is calm, peaceful, and inspiring. The photo should highlight her focus and the beautiful, tranquil setting.'
  },
  {
    category: 'Lifestyle',
    title: 'Cooking in a Modern Kitchen',
    template: '{name} cheerfully cooking in a bright, modern kitchen filled with fresh ingredients. Flour dusts her hands as she kneads dough. The shot is candid and full of life, capturing a genuine moment of joy. Natural light floods the scene, making it feel authentic and relatable.'
  },
];
