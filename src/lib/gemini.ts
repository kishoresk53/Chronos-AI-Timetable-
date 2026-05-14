import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateScheduleFromAI(prompt: string, existingItems: ScheduleItem[]): Promise<ScheduleItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an expert time management assistant. 
        User Request: "${prompt}"
        
        Current Schedule Context (as JSON): ${JSON.stringify(existingItems)}
        
        Generate a list of schedule items that satisfy the user's request while avoiding obvious overlaps with the current schedule.
        Return ONLY a JSON array of objects with these properties:
        - title: string
        - startTime: string (HH:mm)
        - endTime: string (HH:mm)
        - days: Array of strings ("Monday", "Tuesday", etc.)
        - priority: "low", "medium", or "high"
        - category: "Work", "Study", "Health", "Personal", "Leisure", "Social", "Errands"
        - isRecurring: boolean
        
        Do not include markdown tags. Return valid JSON only.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              priority: { type: Type.STRING },
              category: { type: Type.STRING },
              isRecurring: { type: Type.BOOLEAN }
            },
            required: ["title", "startTime", "endTime", "days", "priority", "category", "isRecurring"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Gemini AI error:", error);
    return [];
  }
}
