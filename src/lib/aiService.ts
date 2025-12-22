// AI Service using Groq API
// Documentation: https://console.groq.com/docs/quickstart

const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const SITE_URL = "https://lifeos-ai.app";
const SITE_NAME = "LifeOS AI";

interface AIMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

export const getAICompletion = async (messages: AIMessage[]) => {
    if (!API_KEY) {
        console.warn("Missing VITE_GROQ_API_KEY");
        return null;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile", // Latest supported model
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq API Error: ${err}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || null;
    } catch (error) {
        console.error("AI Service Error:", error);
        return null; // Fallback will be handled by caller
    }
};

export const getMoodFeedback = async (mood: string, userName: string) => {
    const messages: AIMessage[] = [
        {
            role: "system",
            content: "You are an empathetic wellness coach. Provide short, encouraging feedback (max 20 words) and one simple, specific activity suggestion."
        },
        {
            role: "user",
            content: `I am feeling "${mood}". My name is ${userName}. Suggest something for me.`
        }
    ];

    const feedback = await getAICompletion(messages);
    return feedback || getFallbackFeedback(mood);
};

const getFallbackFeedback = (mood: string) => {
    const fallbacks: Record<string, string> = {
        "Stressed": "Take a deep breath. Try our 20s breathing exercise.",
        "Sad": "Be kind to yourself. Maybe a short walk would help?",
        "Calm": "Enjoy this peace. It's a great time to read or plan.",
        "Good": "Great to hear! Keep this momentum going.",
        "Energetic": "You're on fire! Tackle your biggest task now."
    };
    return fallbacks[mood] || "Stay positive and keep moving forward!";
};
