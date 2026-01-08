import { GoogleGenAI, Type } from "@google/genai";
import { EbookConfig, Chapter } from "../types";

// Initialize AI once at the top level
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an educational eBook outline based on configuration.
 */
export const generateOutline = async (config: EbookConfig): Promise<Chapter[]> => {
  const prompt = `You are an expert eBook writer and educator.
Generate a complete, well-structured eBook outline for students.

Topic: ${config.title}
Target Audience / Class Level: ${config.classLevel}
Language: ${config.language}
Length: ${config.length}
Tone: Simple, clear, and easy to understand

Requirements:
1. Create logical chapters with clear educational progression.
2. Include a "Conclusion / Summary" and "Key Takeaways" as the final sections.
3. Format the output as a JSON array of exactly ${config.chapterCount} objects with 'title' and 'summary' keys.

Provide final outline only in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ['title', 'summary']
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI while generating outline.");
    
    const rawJson = JSON.parse(text);
    return rawJson.map((item: any, index: number) => ({
      id: `ch-${index}-${Date.now()}`,
      title: item.title,
      summary: item.summary,
      content: '',
      status: 'pending'
    }));
  } catch (error) {
    console.error("Outline generation error:", error);
    throw error;
  }
};

/**
 * Generates the full content for a specific chapter.
 */
export const generateChapterContent = async (
  config: EbookConfig, 
  chapter: Chapter, 
  fullOutline: Chapter[]
): Promise<string> => {
  const isLast = fullOutline[fullOutline.length - 1].id === chapter.id;
  const context = fullOutline.map(c => c.title).join(', ');
  
  const prompt = `You are an expert eBook writer and educator.
Generate the content for this specific chapter of an educational eBook.

Book Topic: ${config.title}
Target Audience / Class Level: ${config.classLevel}
Language: ${config.language}
Chapter Title: ${chapter.title}
Chapter Goal: ${chapter.summary}
Tone: Simple, clear, and easy to understand

Formatting Rules:
1. Use clear HTML headings (<h3>, <h4>).
2. Use short paragraphs for readability.
3. Use bullet points (<ul>, <li>) where helpful.
4. Explain concepts in simple language suitable for the ${config.classLevel} level.
5. Use practical examples where helpful.
6. Provide final eBook content only.
7. DO NOT include explanations, notes, or meta-commentary.
8. Output MUST be ready for direct PDF or EPUB generation.

${isLast ? "This is the final section. Include a Conclusion / Summary and a Key Takeaways list." : ""}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Chapter generation error:", error);
    throw error;
  }
};

/**
 * Generates a marketing blurb for the eBook.
 */
export const generateBlurb = async (config: EbookConfig, outline: Chapter[]): Promise<string> => {
  const outlineStr = outline.map(c => c.title).join(', ');
  const prompt = `Write a professional educational blurb for this eBook.
Title: ${config.title}
Audience: ${config.classLevel}
Key Topics: ${outlineStr}

Write in an encouraging, educational tone that highlights what the student will learn.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No blurb generated.";
  } catch (error) {
    console.error("Blurb generation error:", error);
    return "Failed to generate blurb.";
  }
};

/**
 * Generates a cover image using nano banana series models.
 */
export const generateCoverImage = async (config: EbookConfig): Promise<string> => {
  const prompt = `A modern, clean, minimal eBook cover illustration for the topic: ${config.title}. 
Style: Minimalist, educational, professional. 
Suitable for students (${config.classLevel}).
Color palette should be professional.
DO NOT include any text, letters, or numbers in the image. 
Focus on clear, high-quality educational symbolism.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    
    throw new Error("No image data found in AI response");
  } catch (error) {
    console.error("Cover image generation error:", error);
    throw error;
  }
};