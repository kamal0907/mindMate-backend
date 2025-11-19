import express from 'express'
const router = express.Router();
import sanitizeHtml from 'sanitize-html'

//Models
import User from '../models/user.model.js';
import Diary from '../models/diary.model.js';

//Middlewares
import { authMiddleware, ensureAuthenticated } from '../middlewares/auth.middleware.js';

//Validations
import { postDiaryRequestBodySchema } from '../validations/request.validations.js';


router.post('/diary', authMiddleware, ensureAuthenticated, async (req, res) => {
   try {
     const validationResult = await postDiaryRequestBodySchema.safeParseAsync(req.body);

    if(!validationResult.success)
        return res.status(400).json({error : "Validation Error", message : validationResult.error.flatten().fieldErrors})

    const {content , emotions, isPublic = false} = validationResult.data;

    const sanitizeContent = sanitizeHtml(content, {
        allowedAttributes : {},
        allowedTags : []
    }).trim();

    const diaryEntry = {
        user : req.user.id,
        content : sanitizeContent,
        isPublic
    }

    if (emotions)
        diaryEntry.emotions = emotions;

    const result = await Diary.create(diaryEntry);

    return res.status(201).json({
        message : "Diary entry created",
        data : {
            id : result._id,
            content : result.content,
            emotions : result.emotions,
            isPublic : result.isPublic,
            createdAt : result.createdAt
        }
    })
   } catch (error) {
    console.log("Diary creation error");
    return res.status(500).json({error : "Internal Server Error"});
    
   }
})

export default router;