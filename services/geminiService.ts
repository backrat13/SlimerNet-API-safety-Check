import { GoogleGenAI, Type } from "@google/genai";
import { ApiProcess, RiskLevel } from "../types";

// NOTE: In a real environment, API Key should be securely managed.
// This relies on process.env.API_KEY being present in the runtime.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

export const chatWithSlimer = async (
  history: { role: string; text: string }[], 
  newMessage: string,
  contextData?: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const systemInstruction = `
      You are SlimerNet's AI Agent. You are a cyber-security expert with a persona of a friendly, slightly gooey, green ghost. 
      You help the user analyze their API traffic and running processes.
      You are witty but very knowledgeable about ports, protocols, and malware.
      
      Current System Context (Mock Data):
      ${contextData || "No active scan data available."}

      If the user asks about a specific process, explain what it does, what standard ports it uses, and if it's safe.
      Always be helpful and emphasize security.
    `;

    const model = 'gemini-2.5-flash';
    
    // Construct the chat
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Feed history (simplified for this demo, usually we'd add history to the chat object)
    // For this simple implementation, we'll just send the message with context embedded in system instruction.
    
    const result = await chat.sendMessage({
        message: newMessage
    });

    return result.text || "I'm having trouble connecting to the ecto-containment unit (API Error).";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Ecto-containment breach! (Error connecting to AI)";
  }
};

export const analyzeProcessWithAI = async (processName: string, port: number): Promise<{ risk: RiskLevel, explanation: string }> => {
    try {
        const ai = getAiClient();
        const prompt = `Analyze this process: Name="${processName}", Port=${port}. 
        Return JSON with fields: 
        - risk (enum: SAFE, SUS, CRITICAL, UNKNOWN)
        - explanation (short sentence on what it does and who it talks to).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        risk: { type: Type.STRING, enum: [RiskLevel.SAFE, RiskLevel.SUS, RiskLevel.CRITICAL, RiskLevel.UNKNOWN] },
                        explanation: { type: Type.STRING }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || "{}");
        return {
            risk: json.risk || RiskLevel.UNKNOWN,
            explanation: json.explanation || "No data available from the ghostly archives."
        };

    } catch (e) {
        console.error("Analysis failed", e);
        return { risk: RiskLevel.UNKNOWN, explanation: "AI Analysis failed." };
    }
}