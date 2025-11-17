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