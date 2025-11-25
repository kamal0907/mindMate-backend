export async function chatProvider({message, meta}) {

    const provider = (process.env.CHAT_PROVIDER).toLowerCase();

    switch(provider){
        case 'ollama':
        case 'gemini':
    }
}