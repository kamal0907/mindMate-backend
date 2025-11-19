import express from 'express'
const router = express.Router();
import sanitizeHtml from 'sanitize-html'

//Models
import User from '../models/user.model.js';
import Diary from '../models/diary.model.js';

//Middlewares
import { authMiddleware, ensureAuthenticated } from '../middlewares/auth.middleware.js';

//Validations
import { postDiaryRequestBodySchema, putDiaryRequestBodySchema } from '../validations/request.validations.js';
import mongoose from 'mongoose';


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

router.get('/diary', authMiddleware, ensureAuthenticated, async (req,res) => {
    try {
        const enteries = await Diary.find({user : req.user.id})
        .sort({createdAt : -1})
        .lean();

        return res.json({
            data : enteries
        });

    } catch (error) {
        console.log("GET /api/diary error", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.get('/diary/public', authMiddleware, async (req,res) => {
    try {
        const enteries = await Diary.find({isPublic : true})
        .sort({ createdAt : -1})
        .lean();

        return res.json({
            data : enteries
        })
    } catch (error) {
        console.log("Get /api/diary/public", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.get('/diary/:id', authMiddleware, ensureAuthenticated, async (req,res) => {
    try {
        const diaryId = req.params.id;

        if(!mongoose.Types.ObjectId.isValid(diaryId))
            return res.status(400).json({error : "Invalid diary Id"});
         
        const entry = await Diary.findById({ _id : diaryId, user : req.user.id})
        .lean()
        .exec();

        if(!entry)
            return res.status(404).json({error : "Diary entry not found"});

        return res.json({
            data : entry
        })
    } catch (error) {
        console.log("GET api/diary:id error", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

router.delete('/diary/:id', authMiddleware, ensureAuthenticated, async (req,res) => {
    try {
        const diaryId = req.params.id;

        if(!mongoose.Types.ObjectId.isValid(diaryId))
            return res.status(400).json({error : "Invalid diaryId"});

        const entry = await Diary.findOneAndDelete({ _id : diaryId, user : req.user.id});

        if (!entry) 
            return res.status(404).json({error : "Diary entry not found"})

        return res.status(200).json({
            status : "success",
            message : "Diary entry successfully deleted"
        })

    } catch (error) {
        console.log("DELETE api/diary/:id", error);
        return res.status(500).json({error: "Internal Server Error"})
    }
})

router.put('/diary/:id', authMiddleware, ensureAuthenticated, async (req,res) => {
    try {
        const diaryId = req.params.id;
         
        if(!mongoose.Types.ObjectId.isValid(diaryId))
            return res.status(400).json({error : "Invalid diaryId"});

        const validationResult = await putDiaryRequestBodySchema.safeParseAsync(req.body);

        if(!validationResult.success)
            return res.status(400).json({
                message : "Validation error",
                details : validationResult.error.flatten().fieldErrors()
            }) 
        
        const { content, emotions, isPublic } = validationResult.data;

        const updateObj = {}

        if (typeof content !== undefined){
            updateObj.content = sanitizeHtml(content, {
                allowedAttributes : {},
                allowedTags : []
            }).trim();
        }

        if( typeof emotions !== undefined){
            updateObj.emotions = emotions;
        }
        if( typeof isPublic !== undefined){
            updateObj.isPublic = isPublic;
        }

        if(Object.keys(updateObj).length === 0)
            return res.status(400).json({error : "No field is updated"})

        const updated = await Diary.findOneAndUpdate(
            {_id : diaryId, user : req.user.id},
            { $set : updateObj},
            {new : true, runValidators : true}
        ).lean();

        if(!updated)
            return res.status(400).json({error : "Diary is not found or you are not the owner"})

        return res.json({
            message : "Diary is updated successfully",
            data : updated
        })

    } catch (error) {
        console.log("PUT api/diary/:id", error);
        return res.status(500).json({error : "Internal Server Error"})
    }
})

export default router;