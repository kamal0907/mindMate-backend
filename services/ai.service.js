import { chatProvider } from './chat.service.js';

export async function analyzeSentiment(text) {
    const prompt = `
    Analyze the emotional content of the following journal entry. 
    Provide scores from 0 to 10 for the following emotions: happy, sad, angry, anxious, calm, excited, grateful, hopeful.
    Return ONLY a valid JSON object in this format:
    {"happy": 0, "sad": 0, "angry": 0, "anxious": 0, "calm": 0, "excited": 0, "grateful": 0, "hopeful": 0}

    Entry: "${text}"
    `;

    try {
        const response = await chatProvider({ message: prompt });
        // Clean the response in case the AI wraps it in markdown or adds text
        const jsonMatch = response.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse AI sentiment response");
    } catch (error) {
        console.error("Sentiment Analysis Error:", error);
        // Fallback to neutral/empty emotions
        return { happy: 0, sad: 0, angry: 0, anxious: 0, calm: 0, excited: 0, grateful: 0, hopeful: 0 };
    }
}

export async function generateWeeklyInsights(userName, diaryEntries, gratitudeEntries) {
    const context = `
    User: ${userName}
    Recent Diary Entries: ${diaryEntries.map(e => e.content).join(' | ')}
    Recent Gratitude Items: ${gratitudeEntries.map(e => e.content).join(' | ')}
    `;

    const prompt = `
    Based on the following journal and gratitude history, provide:
    1. A short, empathetic "Pulse" summary (max 15 words) about how the user has been feeling.
    2. A "MindMate Tip" (max 30 words) with a specific, actionable wellness recommendation.
    
    Return ONLY a valid JSON object in this format:
    {"pulse": "...", "tip": "..."}

    Context: ${context}
    `;

    try {
        const response = await chatProvider({ message: prompt });
        const jsonMatch = response.match(/\{.*\}/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse AI insights response");
    } catch (error) {
        console.error("Insights Generation Error:", error);
        return { 
            pulse: "Continue your journey of self-discovery.", 
            tip: "Try taking a few deep breaths whenever you feel overwhelmed today." 
        };
    }
}

export function generateEmotionCloud(diaryEntries) {
    const cloud = {};
    diaryEntries.forEach(entry => {
        if (entry.emotions) {
            Object.entries(entry.emotions).forEach(([emo, val]) => {
                if (val > 3) { // Only count significant emotions
                    cloud[emo] = (cloud[emo] || 0) + val;
                }
            });
        }
    });

    return Object.entries(cloud)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value);
}

export function getCopingSuggestions() {
    return {
        anxious: [
            "Practice the 4-7-8 breathing technique.",
            "Try a 5-minute grounding exercise (5 things you see, 4 you feel...).",
            "Listen to calming lo-fi or nature sounds."
        ],
        stressed: [
            "Take a short walk away from your workspace.",
            "Prioritize your task list and focus only on the next small step.",
            "Stretch your neck and shoulders for 2 minutes."
        ],
        sad: [
            "Reach out to a trusted friend for a brief chat.",
            "Watch a comfort movie or read a favorite book.",
            "Write down three small things you're grateful for today."
        ],
        angry: [
            "Try a high-intensity workout or a brisk walk.",
            "Write a 'venting' letter (but don't send it).",
            "Practice progressive muscle relaxation."
        ],
        overwhelmed: [
            "Break your biggest task into 5 tiny, manageable pieces.",
            "Take a 10-minute 'digital detox'—no screens.",
            "Focus on your breath and remind yourself it's okay to slow down."
        ],
        neutral: [
            "Use this calm time to plan something enjoyable for later.",
            "Read an article about a topic that interests you.",
            "Practice a few minutes of mindful observation."
        ],
        hopeful: [
            "Write down a goal you're excited about for the next month.",
            "Share your positive energy with someone else.",
            "Reflect on what led to this feeling of hope."
        ]
    };
}
