
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async generateCampaignContent(templateName, customerCount) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short marketing snippet for a campaign titled "${templateName}" targeting ${customerCount} logistics customers. Focus on reliability and recovery.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  },

  async analyzeCustomerRisk(customer) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze risk for customer: ${JSON.stringify(customer)}. 
      Provide: 
      1. Suggested recovery strategy. 
      2. Reasoning for the prediction score of ${customer.repaymentProbability}%.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] }
          },
          required: ["strategy", "reasoning", "priority"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
};
