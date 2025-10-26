const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const getTokenFromHeader = require('./getTokenFromHeader')
dotenv.config({path:'../configs/.env'})
const User = require('../models/userModels')    


const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.SECRET_TOKEN_KEY);
        
        // User-i tap
        const user = await User.findOne({ where: { id: decoded.userId } });
        
        // Refresh token uyğunluğunu yoxla
        if (!user || user.refreshToken !== refreshToken) {
            if (user) {
                await User.update({ refreshToken: null }, { where: { id: user.id } });
            }
            return null;
        }

        // Yeni refresh token yarat
        const newRefreshToken = jwt.sign(
            { userId: user.id },
            process.env.SECRET_TOKEN_KEY,
            { expiresIn: '7d' }
        );

        // Token version-u artır
        const newTokenVersion = user.tokenVersion + 1;

        // DB-də update et
        await User.update(
            { refreshToken: newRefreshToken, tokenVersion: newTokenVersion },
            { where: { id: user.id } }
        );

        const newAccessToken = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                tokenVersion: newTokenVersion
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '15m', algorithm: 'HS256' }
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user
        };
    } catch (error) {
        console.error('[-] Refresh token verification failed:', error.message);
        return null;
    }
};

const isAuthenticated = async (req, res, next) => {
    let token = getTokenFromHeader(req);
    const refreshToken = req.cookies?.refreshToken;

    if (!token && !refreshToken) {
        console.error('[-] No tokens provided');
        res.locals.user = null;
        return res.redirect('/auth/login');
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
            const user = await User.findOne({ where: { id: decoded.userId } });

            if (!user) {
                console.error('[-] User not found');
                throw new Error('User not found');
            }

            if (user.tokenVersion !== decoded.tokenVersion) {
                console.log('[*] Token version mismatch, trying to refresh...');
                throw new Error('Token version mismatch');
            }

            req.user = user;
            res.locals.user = user;
            return next();

        } catch (error) {
            console.log('[*] Access token invalid/expired, attempting refresh...');
            throw new Error('Access token invalid/expired,Err: ', error.message);
        }
    }

    if (refreshToken) {
        console.log('[*] Refreshing access token...');
        const refreshResult = await refreshAccessToken(refreshToken);

        if (!refreshResult) {
            console.error('[-] Refresh token invalid, redirecting to login');
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.redirect('/auth/login');
        }

        res.cookie('accessToken', refreshResult.accessToken, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000 // 15 dəqiqə
        });

        res.cookie('refreshToken', refreshResult.refreshToken, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
        });

        req.user = refreshResult.user;
        res.locals.user = refreshResult.user;

        console.log('[+] Access token refreshed successfully');
        return next();
    }

    console.error('[-] Authentication failed');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.redirect('/auth/login');
};

const isAdmin = (req,res,next)=>{

    if(req.user && req.user.isAdmin){
        next()
    }

    else{
        console.error('[-] Access denied, admin only!');
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

        req.user = user;         
        res.locals.user = user; 
        next();
    } catch (err) {
        res.locals.user = null;
        next();
    }
}

module.exports = {isAuthenticated,isAdmin,userControlMiddleware};