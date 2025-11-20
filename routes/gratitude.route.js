import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';

//Models
import Gratitude from '../models/gratitude.model.js';

//Middlewares
import { authMiddleware, ensureAuthenticated } from '../middlewares/auth.middleware.js';

//Validations 
import { postGratitudeRequestBodySchema} from '../validations/request.validations.js';

//Services
import {sanitizedContent} from '../services/content.service.js'

router.post('/gratitude', authMiddleware, ensureAuthenticated, async (req, res) => {
    try {
        const validationResult = await postGratitudeRequestBodySchema.safeParseAsync(req.body);

        if(!validationResult.success)
            return res.status(400).json({message : "Validation Error", details : validationResult.error.flatten().fieldErrors()});

        const {content} = validationResult.data;

        const sanitizeContent = await sanitizedContent(content);

        const result = await Gratitude.create({
            user : req.user.id,
            content : sanitizeContent
        })

        return res.status(201).json({
            _id : result.id,
            data : {
                content : result.content
            }
        })
    } catch (error) {
        console.log("POST /api/gratitude", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.get('/gratitude/:id',authMiddleware, ensureAuthenticated, async (req, res) => {
    try {
        const gratitudeId = req.params.id;

        if(!mongoose.Types.ObjectId.isValid(gratitudeId))
            return res.status(400).json({error : "Invalid gratitudeId"});

        const result = await Gratitude.findOne({
            user : req.user.id,
            _id : gratitudeId
        })

        if(!result) 
            return res.status(404).json({error : "Gratitude entry not found or you are not the owner"})

        return res.json({
            data : result
        })
    } catch (error) {
        console.log("GET /api/gratitude", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

export default router