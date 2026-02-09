import { GoogleGenAI, Type } from "@google/genai";
import { Lesson, Slide, SlideType } from "../types";

// NOTE: In a real app, do not expose API_KEY in frontend code.
// This should be proxied through a backend.
let ai: GoogleGenAI | null = null;

export const initGemini = (apiKey: string) => {
  ai = new GoogleGenAI({ apiKey });
};

export const generateLessonDraft = async (
  topic: string, 
  profile: any
): Promise<Lesson> => {
  if (!ai) throw new Error("Gemini API not initialized. Please provide an API key.");
  const model = "gemini-2.5-flash"; // Fast model for logic

  const prompt = `
    Create a lesson plan for children aged 3-6.
    Topic: "${topic}"
    Language: ${profile.language}
    Grade: ${profile.grades.join(', ')}
    Total Slides: 5 (Strictly)
    
    Structure:
    1. Cover Slide
    2. Intro Content Slide
    3. Deep Dive Content Slide
    4. Interactive Quiz Slide (Multiple Choice)
    5. Ending/Celebration Slide

    Output strictly in JSON.
    For images, provide a very descriptive, cute, vibrant, flat-style illustration prompt suitable for children.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["cover", "content", "quiz", "ending"] },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                speakerNotes: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                quiz: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    rewardMessage: { type: Type.STRING }
                  },
                  nullable: true
                }
              },
              required: ["id", "type", "title", "imagePrompt"]
            }
          }
        }
      }
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return {
      id: crypto.randomUUID(),
      topic,
      slides: data.slides.map((s: any) => ({
        ...s,
        id: crypto.randomUUID(),
        // Assign a default placeholder until we generate real ones
        imageUrl: undefined 
      }))
    };
  }
  
  throw new Error("Failed to generate lesson draft");
};

export const generateSlideImage = async (prompt: string): Promise<string> => {
  if (!ai) throw new Error("Gemini API not initialized. Please provide an API key.");
  try {
    // Using the Nano Banana (Flash Image) model
    // In production, catch errors and fall back or show toast
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: `Kid friendly, vector art, flat style, bright colors, high contrast, cute: ${prompt}` }
        ]
      },
      config: {
         // config for aspect ratio if supported by the specific model version
      }
    });

    // Check for inline data (Base64)
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback if model returns a link (depending on specific model version behavior)
    // or if the simulation is needed.
    return `https://picsum.photos/seed/${Math.random()}/800/450`;

  } catch (error) {
    console.error("Image gen error", error);
    return "https://picsum.photos/800/450?grayscale";
  }
};

export const generateVideoTransition = async (slideA: Slide, slideB: Slide): Promise<string> => {
  // MOCK: Real Veo generation takes time (min+) and is async.
  // We cannot block the UI for this in a prototype without a backend poller.
  // This function simulates the API call structure.
  
  /*
  const operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Smooth cartoon transition. ${slideA.imagePrompt} morphing into ${slideB.imagePrompt}. Magical sparkles.`,
    config: {
      aspectRatio: '16:9',
      resolution: '720p'
    }
  });
  // ... poll operation ...
  */
 
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve("transition_video_url.mp4");
    }, 1000);
  });
};
