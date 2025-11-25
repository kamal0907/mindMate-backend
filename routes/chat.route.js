import express from 'express';
const router = express.Router();

// Models
import Chat from '../models/chat.model';

// Middlewares
import { authMiddleware, ensureAuthenticated } from '../middlewares/auth.middleware';

// Validations
import { postChatRequestBodySchema } from '../validations/request.validations';

// Services
import { sanitizedContent } from '../services/content.service';
import { chatProvider } from '../services/chat.service';

router.post('/chat', authMiddleware, ensureAuthenticated, async (req, res) => {

    const validationResult = await postChatRequestBodySchema.safeParseAsync(req.body);

    if(!validationResult.success)
        return res.status(400).json({error : validationResult.error.flatten().fieldErrors});

    const {message} = validationResult.data;

    const sanitizedMessage = await sanitizedContent(message);

    if(!sanitizedMessage)
        return res.status(400).json({error : "Empty message after sanitize"})

    const meta = {
        userId : req.user.id
    }

    try {
        
        const reply = await chatProvider({sanitizedMessage, meta});

        const safeReply = await sanitizedContent(reply ?? '');

        return res.json({
            reply : safeReply
        })
    } catch (error) {
        console.log("POST /api/chat", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})


export default router