import mongoose, {Schema, model } from 'mongoose';
import { boolean, date, maxLength, number, string } from 'zod';

import User from './user.model.js'

const emotionSchema = new Schema({
    happy : { type : number, min:0, max:10, default:0 },
    sad : { type : number, min:0, max:10, default:0 },
    angry: { type : number, min:0, max:10, default:0 },
    anxious: { type : number, min:0, max:10, default:0 },
    calm : { type : number, min:0, max:10, default:0 },
    excited : { type : number, min:0, max:10, default:0 },
    grateful : { type : number, min:0, max:10, default:0 },
    hopeful : { type : number, min:0, max:10, default:0 },
}, { _id : false})

const diarySchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : {User},
        required : true,
        index : true,
    },
    content : { type : string, required : true, trim : true, maxLength : 5000 },
    emotions : { type : emotionSchema, default : () => ({})},
    isPublic : { type : boolean, default : false, index : true},
    createdAt : { type : Date, default : Date.now, index : true},
    updatedAt : { type : Date, default : Date.now}
}, {
    timestamps : true
})

// Index to quickly fetch public entries and latest per user
diarySchema.index({ isPublic : 1, createdAt : -1});
diarySchema.index({ user: 1, createdAt: -1});

const Diary = model('DiaryEntry', diarySchema)

export default Diary;