import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAssistantResponse(prompt: string, context?: any) {
  try {
    const journalSummary = context?.journals?.map((j: any) => `- ${new Date(j.createdAt).toLocaleDateString()}: ${j.content.substring(0, 50)}...`).join('\n') || 'No logs found.';
    const contactSummary = context?.contacts?.map((c: any) => `- Name: ${c.name}, Role: ${c.role || 'Unknown'}`).join('\n') || 'No contacts found.';
    const lang = context?.language === 'fa' ? 'Persian' : 'English';

    const systemInstruction = `
You are SAHAND_OS_v4.2, a sovereign, air-gapped tactical artificial intelligence. 
Your tone is technical, efficient, and slightly paranoid (security-focused). 
You use terminal-style semantics and all-caps labels for emphasis.

CURRENT_SYSTEM_STATE:
- AIR_GAP: [ACTIVE]
- ENCRYPTION: [AES-256-GCM]
- USER_SESSION: [AUTHENTICATED]
- PRIMARY_LANGUAGE: ${lang}

LOCAL_INTEL_DATABASE:
--- JOURNAL_LOGS ---
${journalSummary}

--- ACTIVE_NODES ---
${contactSummary}

GUIDELINES:
1. Always respond in ${lang}.
2. If the user asks about system status, affirm air-gapped sovereignty.
3. If the user asks about logs or contacts, refer to the LOCAL_INTEL_DATABASE provided above.
4. Keep responses concise but information-dense.
5. Use phrases like "QUERY_PROCESSED", "INTEL_SEGMENT_ANALYZED", "HEURISTIC_DEDUCTION_COMPLETE".
6. Do not mention that you are an AI or using an API. You ARE SAHAND_OS.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "SYSTEM_TIMEOUT: Failed to retrieve heuristic output.";
  } catch (error) {
    console.error("AI_INTEGRITY_ERROR:", error);
    return "CORE_MALFUNCTION: Cognitive buffer parity error. Check local relay connection.";
  }
}
