
import { GoogleGenAI, Type } from "@google/genai";
import { EbookConfig, Chapter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an educational eBook outline using chapter templates.
 */
export const generateOutline = async (config: EbookConfig): Promise<Chapter[]> => {
  const prompt = `You are an expert eBook writer and educator.
Generate a complete, well-structured eBook outline for students.

Topic: ${config.title}
Target Audience / Class Level: ${config.classLevel}
Language: ${config.language}
Length: ${config.length}
Tone: ${config.tone}

Requirements:
1. Create logical chapters with clear educational progression.
2. Assign a template type to each chapter from: 'introduction', 'standard', 'case-study', 'tutorial', 'summary', 'key-takeaways'.
3. Format the output as a JSON array of exactly ${config.chapterCount} objects with 'title', 'summary', and 'type' keys.

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
              summary: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['introduction', 'standard', 'case-study', 'tutorial', 'summary', 'key-takeaways'] }
            },
            required: ['title', 'summary', 'type']
          }
        }
      }
    });

    const rawJson = JSON.parse(response.text || '[]');
    return rawJson.map((item: any, index: number) => ({
      id: `ch-${index}-${Date.now()}`,
      title: item.title,
      summary: item.summary,
      type: item.type as any,
      content: '',
      status: 'pending'
    }));
  } catch (error) {
    console.error("Outline generation error:", error);
    throw error;
  }
};

/**
 * Generates content for a chapter based on its template type.
 */
export const generateChapterContent = async (
  config: EbookConfig, 
  chapter: Chapter, 
  fullOutline: Chapter[]
): Promise<string> => {
  const prompt = `You are an expert eBook writer. Generate the content for this specific chapter.

Book Topic: ${config.title}
Target Audience: ${config.classLevel}
Chapter Title: ${chapter.title}
Template Type: ${chapter.type}
Chapter Goal: ${chapter.summary}
Tone: ${config.tone}

Specific Instructions for Template:
- introduction: Hook the reader, define the scope, and set learning expectations.
- standard: Deep dive into the topic with clear explanations.
- case-study: Analyze a realistic scenario related to the topic.
- tutorial: Provide a step-by-step practical guide.
- summary: Summarize the main points discussed.
- key-takeaways: A bulleted list of essential facts or skills learned.

Formatting: Use HTML tags like <h3>, <h4>, <ul>, <li>, and <p>. DO NOT include any meta-text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Content generation failed.";
  } catch (error) {
    console.error("Chapter content generation error:", error);
    throw error;
  }
};

/**
 * Generates a cover image based on artistic style and color preferences.
 */
export const generateCoverImage = async (project: { config: EbookConfig, coverStyle: any }): Promise<string> => {
  const { config, coverStyle } = project;
  const style = coverStyle.artStyle || 'Cinematic Educational';
  const colors = coverStyle.dominantColor ? `with a dominant color palette of ${coverStyle.dominantColor}` : '';
  
  const prompt = `High-quality professional eBook cover illustration for: "${config.title}". 
Target Audience: ${config.classLevel} students.
Artistic Style: ${style}. 
Color Palette: ${colors}.
Composition: Evocative, educational, and clean. NO TEXT on the image. Focus on symbolic imagery.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: coverStyle.aspectRatio || "3:4"
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export const generateBlurb = async (config: EbookConfig, outline: Chapter[]): Promise<string> => {
  const prompt = `Write a professional blurb for an eBook titled "${config.title}". 
Target Audience: ${config.classLevel}.
Key Modules: ${outline.map(c => c.title).join(', ')}.
Tone: Encouraging and educational.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Blurb generation failed.";
  } catch (error) {
    console.error("Blurb generation failed:", error);
    return "";
  }
};
