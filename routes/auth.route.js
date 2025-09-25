import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'

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

        const user = await User.findOne({ email });
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

export default router;