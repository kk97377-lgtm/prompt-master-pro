import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const { image, mimeType } = await req.json();

        if (!image || !mimeType) {
            return NextResponse.json({ error: 'Image data missing' }, { status: 400 });
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `
      Analyze this image with extreme attention to detail, as if you are a professional photographer and fashion stylist describing it for a high-end 8K regeneration.
      
      Provide a comprehensive English prompt that strictly covers:
      1. **Subject Analysis**: Estimated age (e.g., "23 year old"), ethnicity, skin texture, specific hair color/style, body type.
      2. **Apparel & Accessories**: Detailed breakdown of clothing (e.g., "deep V-neck", "high split", "sheer fabric with embroidery"), shoes, jewelry.
      3. **Pose & Expression**: Look direction (e.g., "looking down", "side profile"), body angle, hand placement (e.g., "holding folding fan lightly").
      4. **Environment & Foreground**: Specific materials (e.g., "red brick patio", "wooden framed windows"), foreground elements (e.g., "blurred green leaves in foreground"), background depth.
      5. **Lighting & Atmosphere**: "Cinematic lighting", "Tyndall effect", "soft natural light", shadows.
      6. **Technical**: "Bokeh", "Depth of field", estimated lens (e.g., "35mm", "85mm"), film grain if any.

      Format the output as a seamless, high-quality prompt paragraph (not a list).

      Also provide:
      - A Traditional Chinese translation of this detailed prompt.
      - 10-15 Tags (English Chinese).
      - Estimated Camera Settings.

      Return structured JSON:
      {
        "description": "Full detailed English prompt...",
        "description_zh": "Full detailed Chinese prompt...",
        "tags": ["Tag1 標籤1", "Tag2 標籤2"],
        "camera_settings": {
            "aperture": "f/...",
            "shutter_speed": "1/...s",
            "iso": "ISO ...",
            "exposure": "... EV"
        }
      }
      Do not include markdown.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: image,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();

        // Simple cleanup if markdown is present
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(cleanedText);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Gemini Analysis Error:', error);

        // Log more specific details
        if (error.response) {
            console.error('API Response Error:', error.response);
        }

        // Check if API key is loaded (don't log the key itself)
        const keyLoaded = !!process.env.GOOGLE_API_KEY;
        console.log('API Key Loaded:', keyLoaded);

        return NextResponse.json(
            { error: error.message || 'Analysis failed', details: error.toString() },
            { status: 500 }
        );
    }
}
