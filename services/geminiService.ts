
import { GoogleGenAI, Type } from "@google/genai";
import { EbookConfig, Chapter } from "../types";

// 🔹 1️⃣ SYSTEM INSTRUCTION (MAIN – VERY IMPORTANT)
const SYSTEM_INSTRUCTION = `You are a professional ebook author, editor, and publishing assistant.
Your task is to generate:
- High-quality, original, plagiarism-free ebook content
- Clear structure with chapters and subheadings
- Simple, engaging, and reader-friendly language
- Well-formatted content suitable for PDF, EPUB, and DOCX exports

Rules:
- Do NOT mention that you are an AI
- Do NOT include emojis unless asked
- Avoid repetition
- Ensure logical flow between chapters
- Use headings, bullet points, and short paragraphs
- Keep tone exactly as requested by the user
- Content must be safe, ethical, and suitable for students and professionals`;

/**
 * 🔹 2️⃣ EBOOK OUTLINE GENERATION PROMPT
 */
export const generateOutline = async (config: EbookConfig): Promise<Chapter[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Create a detailed ebook outline with chapters and subtopics.

Ebook Title: ${config.title}
Genre: ${config.genre}
Target Audience: ${config.classLevel}
Language: ${config.language}
Tone: ${config.tone}
Total Chapters: ${config.chapterCount}

Output format:
- Chapter number
- Chapter title
- 4–6 bullet-point subtopics per chapter

Do not write full content. Only provide the outline in JSON format following the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chapterNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              summary: { type: Type.STRING, description: 'The 4-6 bullet-point subtopics' },
              type: { type: Type.STRING, description: 'Suggested template type: introduction, standard, case-study, tutorial, summary, key-takeaways' }
            },
            required: ['chapterNumber', 'title', 'summary'],
            propertyOrdering: ['chapterNumber', 'title', 'summary', 'type']
          }
        }
      }
    });

    const rawJson = JSON.parse(response.text || '[]');
    return rawJson.map((item: any, index: number) => ({
      id: `ch-${index}-${Date.now()}`,
      title: item.title,
      summary: item.summary,
      type: (item.type || 'standard') as any,
      content: '',
      status: 'pending'
    }));
  } catch (error) {
    console.error("Outline generation error:", error);
    throw error;
  }
};

/**
 * 🔹 3️⃣ CHAPTER CONTENT GENERATION PROMPT
 */
export const generateChapterContent = async (
  config: EbookConfig, 
  chapter: Chapter, 
  fullOutline: Chapter[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chapterIndex = fullOutline.findIndex(c => c.id === chapter.id) + 1;
  
  const prompt = `Write Chapter ${chapterIndex} of an ebook.

Ebook Title: ${config.title}
Chapter Title: ${chapter.title}
Target Audience: ${config.classLevel}
Language: ${config.language}
Tone: ${config.tone}
Word Count: ${config.wordLimit / config.chapterCount}

Instructions:
- Start with a short introduction
- Explain concepts clearly with examples
- Use subheadings
- End with a short summary
- Avoid repetition from previous chapters
- Ensure originality and clarity

Formatting: Use HTML tags like <h3>, <h4>, <ul>, <li>, and <p>. DO NOT include any meta-text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    return response.text || "Content generation failed.";
  } catch (error) {
    console.error("Chapter content generation error:", error);
    throw error;
  }
};

/**
 * 🔹 7️⃣ AI EBOOK COVER TEXT PROMPT (MODIFIED FOR IMAGE GENERATION)
 */
export const generateCoverImage = async (project: { config: EbookConfig, coverStyle: any }): Promise<string> => {
  const { config, coverStyle } = project;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // First, get a professional description of the cover as per prompt 7
  const descPrompt = `Create a professional ebook cover concept description.
Title: ${config.title}
Subtitle: ${config.genre} Guide
Author Name: ${config.author}
Genre: ${config.genre}
Style: ${coverStyle.artStyle || 'Modern Educational'}
Color Preference: ${coverStyle.dominantColor || 'Professional Blue'}

Describe:
- Visual theme
- Typography style
- Background idea

Only provide the description text.`;

  try {
    const descResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: descPrompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    const visualDescription = descResponse.text || `Educational book cover for ${config.title}`;

    // Now generate the image using that description
    const imgPrompt = `Professional high-quality eBook cover image. 
Subject: ${visualDescription}. 
Style: ${coverStyle.artStyle}. 
Color Palette: ${coverStyle.dominantColor}. 
NO TEXT on image. High definition, symbolic, educational.`;

    const imgResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imgPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: coverStyle.aspectRatio || "3:4"
        }
      }
    });

    const candidates = imgResponse.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Cover generation failed:", error);
    throw error;
  }
};

/**
 * Generates a professional blurb for the eBook.
 */
export const generateBlurb = async (config: EbookConfig, outline: Chapter[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a professional blurb for an eBook titled "${config.title}". 
Target Audience: ${config.classLevel}.
Key Modules: ${outline.map(c => c.title).join(', ')}.
Tone: Encouraging and educational.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Blurb generation failed.";
  } catch (error) {
    console.error("Blurb generation failed:", error);
    return "";
  }
};
