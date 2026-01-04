'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('Missing Gemini API Key. AI features will respond with simulated data.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export async function generateImageDescription(prompt: string): Promise<string> {
    if (!apiKey) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`[SIMULATED GEMINI RESPONSE] An artistic visualization of: ${prompt}. featuring cinematic lighting, 8k resolution, and intricate details.`);
            }, 1500);
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const enhancementPrompt = `
      Act as a professional prompt engineer for an AI image generator (like Midjourney).
      Enhance the following simple user prompt into a highly detailed, descriptive, and artistic image generation prompt.
      Focus on lighting, style, composition, and texture.
      
      User Prompt: "${prompt}"
      
      Return ONLY the enhanced prompt text, nothing else.
    `;

        const result = await model.generateContent(enhancementPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        return `Failed to enhance prompt: ${prompt}. Please check your API key.`;
    }
}

export async function analyzeImage(base64Image: string): Promise<string> {
    // base64Image comes as "data:image/png;base64,..."
    // Gemini expects just the base64 string and the mime type

    if (!apiKey) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`[SIMULATED GEMINI VISION] A stunning example image with vibrant colors and clear focus. The subject appears to be a digital artwork.`);
            }, 2000);
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

        // Extract base64 functionality
        const match = base64Image.match(/^data:(.+);base64,(.+)$/);
        if (!match) throw new Error('Invalid image data');

        const mimeType = match[1];
        const data = match[2];

        const prompt = "Describe this image in extreme detail so that an AI could recreate it. Focus on the subject, setting, lighting, artistic style, and colors. Return the description as a single paragraph.";

        const imagePart = {
            inlineData: {
                data: data,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Vision API Error:', error);
        return "Failed to analyze image. Please ensure your API key supports Gemini Vision.";
    }
}
