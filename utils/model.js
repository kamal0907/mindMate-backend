// Using native fetch available in Node 22+

  const systemPrompt = 'You are MindMate, an empathetic assistant. Keep responses supportive and do not provide medical/legal advice. If user is in crisis, encourage contacting emergency services or a hotline.';


export async function gemini ({message, meta, model = 'gemini-2.5'}){
    const GEMINI_URL = process.env.GEMINI_API_URL;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    const url = GEMINI_URL.includes('?') ? `${GEMINI_URL}&key=${GEMINI_KEY}` : `${GEMINI_URL}?key=${GEMINI_KEY}`;

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

export async function ollama({ message, meta = {}, model = 'llama3' }) {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
  const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';

  if (!message) throw new Error('ollama provider: message is required');

  function buildUrl(path = '/api/chat') {
    return `${OLLAMA_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
  }

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    top_p: 0.95
  };

  const controller = new AbortController();
  const timeoutMs = Number(process.env.CHAT_PROVIDER_TIMEOUT_MS || 15000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (OLLAMA_API_KEY) headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;

    const res = await fetch(buildUrl('/api/chat'), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama provider error ${res.status}: ${text}`);
    }

    const data = await res.json();

    // Defensive extraction of reply
    let reply = null;
    if (data?.message?.content) reply = data.message.content;
    else if (Array.isArray(data?.choices) && data.choices[0]?.message?.content)
      reply = data.choices[0].message.content;
    else if (typeof data?.output === 'string') reply = data.output;
    else if (data?.result?.content) reply = data.result.content;
    else reply = JSON.stringify(data).slice(0, 2000);

    return String(reply).trim();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Ollama provider request timed out');
    throw err;
  }
}

export async function grok({ message, meta = {}, model = 'grok-4.20-reasoning' }) {
    const GROK_KEY = process.env.GROK_API_KEY;
    const GROK_URL = 'https://api.x.ai/v1/responses';

    if (!message) throw new Error('Grok provider: message is required');

    const payload = {
        model,
        input: `${systemPrompt}\n\nUser: ${message}`
    };

    const controller = new AbortController();
    const timeoutMs = Number(process.env.CHAT_PROVIDER_TIMEOUT_MS || 15000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(GROK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_KEY}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Grok provider error ${res.status}: ${text}`);
        }

        const data = await res.json();

        // Extracting output_text as per x.ai Responses API documentation
        let reply = data?.output_text || data?.message?.content || JSON.stringify(data).slice(0, 2000);

        return String(reply).trim();
    } catch (err) {
        if (err.name === 'AbortError') throw new Error('Grok provider request timed out');
        throw err;
    }
}

export async function deepseek({ message, meta = {}, model = 'DeepSeek-V3.1' }) {
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const DEEPSEEK_URL = 'https://api.sambanova.ai/v1/chat/completions';

    if (!message) throw new Error('DeepSeek provider: message is required');

    const payload = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ],
        stream: false
    };

    const controller = new AbortController();
    const timeoutMs = Number(process.env.CHAT_PROVIDER_TIMEOUT_MS || 15000);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(DEEPSEEK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`DeepSeek provider error ${res.status}: ${text}`);
        }

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 2000);

        return String(reply).trim();
    } catch (err) {
        if (err.name === 'AbortError') throw new Error('DeepSeek provider request timed out');
        throw err;
    }
}
