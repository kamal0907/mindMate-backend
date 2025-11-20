import { validateUserToken } from '../utils/token.js';

export const authMiddleware = async (req,res,next) => {
    const tokenHeader = req.headers['authorization'];

    if(!tokenHeader)
        return next();

    if(!tokenHeader.startsWith('Bearer')) {
        return res.status(400)
        .json({error : "Token start with the Bearer"})
    }

    const token = tokenHeader.split(' ')[1];

    const decoded =  await validateUserToken(token);

    if(!decoded) 
        return res.status(401).json({error : "Token is expired or invalid"});
    
    req.user = decoded;
    next();
}

export const ensureAuthenticated = async (req,res,next) => {
    if(!req.user){
        return res.status(401)
        .json({error : "You are not authenticated"});
    }
    next();
}
