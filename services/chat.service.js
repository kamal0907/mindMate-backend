import { gemini } from '../utils/model.js'


export async function chatProvider({message, meta, model}) {

    const provider = (process.env.CHAT_PROVIDER).toLowerCase();

    switch(provider){
        case 'ollama':
            return await ollama({message, meta, model})
        case 'gemini':
            default:
                return await gemini({message, meta, model})
    }
}