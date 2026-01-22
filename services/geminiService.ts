
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
  const prompt = `Create a detailed ebook outline with chapters and subtopics for an eBook.

Ebook Title: ${config.title}
Genre: ${config.genre}
Target Audience: ${config.classLevel}
Language: ${config.language}
Tone: ${config.tone}
Total Chapters: ${config.chapterCount}

Requirements for the outline:
- Provide exactlly ${config.chapterCount} chapters.
- Each chapter must have a title and a summary consisting of 4–6 bullet-point subtopics.
- Suggest a structural template for each (introduction, standard, case-study, tutorial, summary, key-takeaways).

Format the output strictly as a JSON array of objects.`;

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
              chapterNumber: { 
                type: Type.INTEGER,
                description: "The sequence number of the chapter."
              },
              title: { 
                type: Type.STRING,
                description: "Clear and engaging chapter title."
              },
              summary: { 
                type: Type.STRING, 
                description: 'A list of 4-6 bulleted subtopics for this chapter.' 
              },
              type: { 
                type: Type.STRING, 
                description: 'Template type: introduction, standard, case-study, tutorial, summary, or key-takeaways.' 
              }
            },
            required: ['chapterNumber', 'title', 'summary', 'type'],
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
Word Count Target: ${Math.floor(config.wordLimit / config.chapterCount)} words

Instructions:
- Start with a short introduction to the chapter.
- Use the following subtopics as your guide: ${chapter.summary}
- Explain concepts clearly with real-world examples.
- Use subheadings (HTML <h3> or <h4>) for structure.
- End with a short summary or bridge to the next chapter.
- Ensure the content is original and matches the ${config.tone} tone.

Formatting: Output the body text using standard HTML tags (<h3>, <h4>, <ul>, <li>, <p>). Do not include <html>, <body> or title tags.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    return response.text || "AI failed to synthesize the chapter content.";
  } catch (error) {
    console.error("Chapter content generation error:", error);
    throw error;
  }
};

/**
 * 🔹 7️⃣ AI EBOOK COVER TEXT PROMPT & IMAGE GENERATION
 */
export const generateCoverImage = async (project: { config: EbookConfig, coverStyle: any }): Promise<string> => {
  const { config, coverStyle } = project;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // First, get a professional description of the cover
  const descPrompt = `Describe a professional ebook cover design concept.
Title: ${config.title}
Subtitle: An Educational Journey
Genre: ${config.genre}
Style: ${coverStyle.artStyle || 'Modern'}
Color Preference: ${coverStyle.dominantColor || 'Professional'}

Describe the visual theme, typography style, and background idea clearly in 2-3 sentences.`;

  try {
    const descResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: descPrompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    const visualDescription = descResponse.text || `Professional educational cover for ${config.title}`;

    // Now generate the image using that description
    const imgPrompt = `High-quality eBook cover illustration. 
Theme: ${visualDescription}. 
Art Style: ${coverStyle.artStyle}. 
Color Palette: ${coverStyle.dominantColor}. 
NO TEXT on the image. High definition, symbolic, professional, educational.`;

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
    throw new Error("Gemini Image API failed to return data.");
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
Key Modules Covered: ${outline.map(c => c.title).join(', ')}.
Tone: Encouraging, educational, and authoritative.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });
    return response.text || "Could not generate blurb.";
  } catch (error) {
    console.error("Blurb generation failed:", error);
    return "";
  }
};
