import 'dotenv/config';
import jwt from 'jsonwebtoken';

import { userTokenSchema } from '../validations/token.validation.js';

export async function createUserToken(payload) {
    // const validationResult = await userTokenSchema.safeParseAsync(payload);

    // if(!validationResult.success)
    //     throw new Error(JSON.stringify(validationResult.error.format()));
    //     //return res.status(400).json({error : validationResult.error.format});

    // const validatePayload = validationResult.data;

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });

    return token;
}

export async function validateUserToken(token) {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}