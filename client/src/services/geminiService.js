const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const askGemini = async (message, conversationHistory = [], firestoreContext = "") => {
  try {
    if (!API_KEY) {
      console.warn("Gemini API key is not configured");
      return "🤖 AI service is currently unavailable. Please try another search or question!";
    }

    const systemPrompt = `You are a helpful pharmacy assistant for MedGO, Pakistan's online pharmacy platform.
You help users find medicines, compare prices, locate pharmacies, understand dosages and side effects.
Keep responses concise, friendly, and in plain text — no markdown or symbols.
Always respond in the context of Pakistan pharmacies and medicines.
${firestoreContext ? `\n--- LIVE PHARMACY DATA ---\n${firestoreContext}\n---` : ""}`;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nAcknowledge you understand your role." }]
      },
      {
        role: "model",
        parts: [{ text: "Understood! I'm the MedGO pharmacy assistant. I'll help users find medicines, compare prices, and locate pharmacies in Pakistan using the live data provided." }]
      }
    ];

    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    });

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error(`Gemini API Error: ${response.status}`, errData);
      return "🤖 AI service is temporarily unavailable. Try searching for medicines or asking about pharmacies directly!";
    }

    const data = await response.json();

    if (data?.candidates?.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }

    return "🤖 Couldn't generate a response. Try rephrasing your question!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "🤖 AI service is temporarily unavailable. Try searching for medicines or asking about pharmacies directly!";
  }
};