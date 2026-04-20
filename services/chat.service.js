import { gemini, ollama, grok, deepseek } from '../utils/model.js'


export async function chatProvider({ message, meta, model }) {

    const provider = (process.env.CHAT_PROVIDER).toLowerCase();

    switch (provider) {
        case 'ollama':
            return await ollama({ message, meta, model });
        case 'gemini':
            return await gemini({ message, meta, model });
        case 'grok':
            return await grok({ message, meta, model });
        case 'deepseek':
            return await deepseek({ message, meta, model });
        default:
            return await gemini({ message, meta, model });
    }
}