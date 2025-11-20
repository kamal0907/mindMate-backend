import mongoose, { Schema, model } from 'mongoose';

import User from './user.model.js'

const emotionSchema = new Schema({
    happy: { type: Number, min: 0, max: 10, default: 0 },
    sad: { type: Number, min: 0, max: 10, default: 0 },
    angry: { type: Number, min: 0, max: 10, default: 0 },
    anxious: { type: Number, min: 0, max: 10, default: 0 },
    calm: { type: Number, min: 0, max: 10, default: 0 },
    excited: { type: Number, min: 0, max: 10, default: 0 },
    grateful: { type: Number, min: 0, max: 10, default: 0 },
    hopeful: { type: Number, min: 0, max: 10, default: 0 },
}, { _id: false })

const diarySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
        index: true,
    },
    content: { type: String, required: true, trim: true, maxLength: 5000 },
    emotions: { type: emotionSchema, default: () => ({}) },
    isPublic: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
})

// Index to quickly fetch public entries and latest per user
diarySchema.index({ isPublic: 1, createdAt: -1 });
diarySchema.index({ user: 1, createdAt: -1 });

const Diary = model('DiaryEntry', diarySchema)

export default Diary;