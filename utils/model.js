import fetch from 'node-fetch';

export async function gemini ({message, meta, model = 'gemini-2.5'}){
    const GEMINI_URL = process.env.GEMINI_API_URL;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    const url = GEMINI_URL.includes('?') ? `${GEMINI_URL}&key=${GEMINI_KEY}` : `${GEMINI_URL}?key=${GEMINI_KEY}`;

    const systemPrompt = 'You are MindMate, an empathetic assistant. Keep responses supportive and do not provide medical/legal advice.'

    console.log(message)

    const payload = {
        contents: [
            {
                parts : [
                    { text : `${systemPrompt}\n\nUser : ${message}`}
                ]
            }
        ],
        // temperature: 0.7,
        // max_output_tokens: 512,
        // candidate_count: 1
    }

    const controller = new AbortController();
    const timeoutMs = Number(process.env.CHAT_PROVIDER_TIMEOUT_MS || 15000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
            },
            body : JSON.stringify(payload),
            signal : controller.signal
        });

        clearTimeout(timeout);

        if(!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Provider error ${res.status} : ${text}`);
        }

        const data = await res.json();

        let reply = null;

         // 1) candidates -> content -> parts -> text (common)
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = data.candidates[0].content.parts[0].text;
        }
        // 2) output_text (some wrappers)
        else if (typeof data?.output_text === 'string') {
        reply = data.output_text;
        }
        // 3) legacy OpenAI-like choices
        else if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
        reply = data.choices[0].message.content;
        }
        // fallback: stringify small piece of JSON
        else {
        reply = JSON.stringify(data).slice(0, 2000);
        }

        return String(reply).trim();
    } catch (err) {
        if (err.name === 'AbortError') 
            throw new Error ('Provider request timed out');
        throw err;
    }
}