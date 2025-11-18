import express from 'express'
const router = express.Router();

//Models
import User from '../models/user.model.js';
import Diary from '../models/diary.model.js';

//Middlewares
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';

router.post('/diary', ensureAuthenticated, async (req, res) => {
    const {content, emotions, ispublic } = req.body;

    const result = await Diary.insertOne({content, emotions, ispublic})

    return res.status(201).json({message : "Diary entry created"})
})

export default router;