const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const getTokenFromHeader = require('./getTokenFromHeader')
dotenv.config({path:'../configs/.env'})
const User = require('../models/userModels')    


const isAuthenticated = async (req, res, next) => {
    const token = getTokenFromHeader(req);

    if (!token) {
        res.locals.user = null
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });

        const user = await User.findOne({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid!',redirectTo: '/auth/login' });
        }

        const tokenVersion = decoded.tokenVersion;
        if (user.tokenVersion !== tokenVersion) {
            return res.status(401).json({
                message: 'Token has been revoked, please log in again!',
                redirectTo: '/auth/refresh-token'
            });
        }

        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token is not valid!',
            redirectTo: '/auth/login' }
        );
    }
};


const isAdmin = (req,res,next)=>{

    if(req.user && req.user.isAdmin){
        next()
    }

    else{
        return res.status(403).json({
            message:'Access denied, admin only!'
        })
    }
}


const userControlMiddleware = async (req,res,next)=>{
    const token = getTokenFromHeader(req);
    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({ where: { id: decoded.userId } });
        if (!user) {
        res.locals.user = null;
        return next();
        }

        const tokenVersion = decoded.tokenVersion;
        if (user.tokenVersion !== tokenVersion) {
        res.locals.user = null;
        return next();
        }

        req.user = user;         // API-lər üçün
        res.locals.user = user;  // EJS templates üçün
        next();
    } catch (err) {
        res.locals.user = null;
        next();
    }
}

module.exports = {isAuthenticated,isAdmin,userControlMiddleware};