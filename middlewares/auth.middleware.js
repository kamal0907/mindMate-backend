import jwt from 'jsonwebtoken';

export const authMiddleware = (req,res,next) => {
    const tokenHeader = req.headers['authorization'];

    if(!tokenHeader)
        return next();

    if(!tokenHeader.startsWith('Bearer')) {
        return res.status(400)
        .json({error : "Token start with the Bearer"})
    }

    const token = tokenHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
}

export const ensureAuthenticated = (req,res,next) => {
    if(!req.user){
        return res.status(401)
        .json({error : "You are not authenticated"});
    }
    next();
}
