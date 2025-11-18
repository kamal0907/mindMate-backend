import express from 'express';
const router = express.Router();
import { OAuth2Client } from 'google-auth-library';

//Models
import User from '../models/user.model.js'

//Services
import { getUserByEmail } from '../services/user.service.js';

//Utils
import { createUserToken } from '../utils/token.js';
import { createHashedPassword } from '../utils/hash.js';

//Validations
import {postSignupRequestBodySchema,
    postLoginRequestBodySchema} from '../validations/request.validations.js'


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

        let user = await getUserByEmail(email);
        if (!user){
            user = await User.create({ name, email, googleId });
        } else if (!user.googleId){
            user.googleId = googleId;
            await user.save();
        }
            
        const jwtpayload = {
            id: user._id,
            email: user.email
        }

        const token = await createUserToken(jwtpayload);

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
    try {
        // const {name, email, password} = req.body;

    // if(!name || !email || !password)
    //     return res.status(400).json({error : "Fill all the information"})

    const validationResult = await postSignupRequestBodySchema.safeParseAsync(req.body);

    if(validationResult.error)
        return res.status(400).json({error : validationResult.error.format})

    const {name, email, password} = validationResult.data;

    const exsitingUser = await getUserByEmail(email);

    if(exsitingUser)
        return res.status(400).json({error : `${email} already have an account`});

    const {salt, password : hashedPassword} = createHashedPassword(password);

    const user = await User.insertOne({name, email, salt, password : hashedPassword});

    return res.status(201).json({message : "success", id : user._id})
    } catch (error) {
        console.error("Signup route error")
        return res.status(500).json({error : "Internal server error"})
    }
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

    const exisitingUser = await getUserByEmail(email);

    if(!exisitingUser)
        return res.status(400).json({error : "Doesn't have an account"});

    const {password : HashedPassword} = createHashedPassword(password, exisitingUser.salt);
    console.log(HashedPassword);

    if(exisitingUser.password != HashedPassword)
        return res.status(400).json({"error": "password is incorrect"})

    const payload = {
        id : exisitingUser._id,
        email : exisitingUser.email
    }

    const token = await createUserToken(payload);

    return res.json({token : token,
        email: exisitingUser.email
    })
   } catch (error) {
    console.error("Login Error");
    return res.status(500).json({
        error : "Internal server error"
    })
   }
})

export default router;