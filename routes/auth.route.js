import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import {createHmac, randomBytes} from 'crypto';
import {postSignupRequestBodySchema, postLoginRequestBodySchema} from '../validations/request.validations.js'

//Models
import User from '../models/user.model.js'

router.post('/loginWithGoogle', async (req, res) => {
    try {
        const { tokenId } = req.body; // token from frontend
        if (!tokenId)
            return res.status(400).json({ error: "Google token is required" });

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const { name, email, sub : googleId } = payload;

        let user = await User.findOne({ email });
        if (!user)
            user = await User.create({ name, email, googleId });

        const jwtpayload = {
            id: user._id,
            email: user.email
        }

        const token = jwt.sign(jwtpayload, process.env.JWT_SECRET, {
            expiresIn: "30d"
        });

        return res.json({
            message: "Logged in successfully",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.post('/signup', async (req,res) => {
    // const {name, email, password} = req.body;

    // if(!name || !email || !password)
    //     return res.status(400).json({error : "Fill all the information"})

    const validationResult = await postSignupRequestBodySchema.safeParseAsync(req.body);

    if(validationResult.error)
        return res.status(400).json({error : validationResult.error.format})

    const {name, email, password} = validationResult.data;

    const exsitingUser = await User.findOne({email});

    if(exsitingUser)
        return res.status(400).json({error : `${email} already have an account`});

    const salt = randomBytes(256).toString('hex');
    const hashedPassword = createHmac('sha256',salt).update(password).digest('hex');

    const user = await User.insertOne({name, email, salt, password : hashedPassword});

    return res.status(201).json({message : "success"})
})

router.post('/login', async (req,res) => {
   try {
    //  const {email, password} = req.body;

    // if(!email || !password) {
    //     return res.status(400).json({error : "Fill the required detials"});
    // }

    const validationResult = await postLoginRequestBodySchema.safeParseAsync(req.body);

    if(validationResult.error)
        return res.status(400).json({error : validationResult.error.format})

    const {email, password} = validationResult.data;

    const exsitingUser = await User.findOne({email});

    console.log(exsitingUser);

    if(!exsitingUser)
        return res.status(400).json({error : "Doesn't have an account"});

    const newHashedPassword = createHmac('sha256',exsitingUser.salt).update(password).digest('hex');

    if(exsitingUser.password != newHashedPassword)
        return res.status(400).json({"error": "password is incorrect"})

    const payload = {
        id : exsitingUser._id,
        email : exsitingUser.email
    }

    const token = jwt.sign(payload,process.env.JWT_SECRET, {
        expiresIn : '30d'
    });

    return res.json({token : token,
        email: exsitingUser.email
    })
   } catch (error) {
    console.error("Login Error");
    return res.status(500).json({
        error : "Internal server error"
    })
   }
})

export default router;