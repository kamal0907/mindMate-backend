import {z} from 'zod';

export const postSignupRequestBodySchema = z.object({
    name : z.string(),
    email : z.string().email(),
    password : z.string().min(3)
})

export const postLoginRequestBodySchema = z.object({
    email : z.string().email(),
    password : z.string().min(3)
})

const emotionSchema = z.object({
    happy : z.number().min(0).max(10).optional(),
    sad : z.number().min(0).max(10).optional(),
    angry: z.number().min(0).max(10).optional(),
    anxious: z.number().min(0).max(10).optional(),
    calm : z.number().min(0).max(10).optional(),
    excited : z.number().min(0).max(10).optional(),
    grateful : z.number().min(0).max(10).optional(),
    hopeful : z.number().min(0).max(10).optional(),
}).optional();

export const postDiaryRequestBodySchema = z.object({
    content : z.string().min(0).max(5000),
    emotions : emotionSchema,
    isPublic : z.boolean().optional()

})

export const putDiaryRequestBodySchema = z.object({
    content : z.string().min(0).max(5000).optional(),
    emotions : emotionSchema,
    isPublic : z.boolean().optional()
})

export const postGratitudeRequestBodySchema = z.object({
    content : z.string().min(1).max(200),
})

export const postChatRequestBodySchema = z.object({
    message : z.string().min(1).max(4000).trim()
})