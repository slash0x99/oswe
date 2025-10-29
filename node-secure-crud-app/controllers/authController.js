const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ResetToken = require('../models/resetModels');
const User = require('../models/userModels');
const { Op } = require('sequelize');
const postTokenToMail = require('../middleware/postTokenToMail'); 
const checkLoginLimit = require('../middleware/checkRateLimit');
const {validateUserInput} = require('../middleware/checkUserInput');

//GET REQUESTS=============================

const verifySessionGet = (req,res)=>{
    return res.status(200).json({
        message:'Session is valid!',
        status:'ok'
    })
}

const verifyAdminSessionGet = (req,res)=>{
    return res.status(200).json({
        message:'Admin session is valid!',
        status:'ok'
    })
}

function loginGet(req,res){
    if(req.user){
        return  res.redirect('/')
    }
    return res.render('auth/login')
}

function registerGet(req,res){
    if(req.user){
        return  res.redirect('/')
    }
    return res.render('auth/register')
}

function resetPasswordGet(req,res){
    if(req.user){
        return  res.redirect('/')
    }
    return res.render('auth/resetPassword')
}

async function resetTokenGet(req,res){
    if(req.user){
        return  res.redirect('/')
    }
    const {token} = req.params;
    
    if(!token){
        return res.status(400).json({message:'Token is required'});
    }

    const resetToken = await ResetToken.findOne({where:{token}})
    if(!resetToken){
        return res.status(400).json({
            message:'Invalid or expired token!'
        })
    }
    return res.render('auth/resetToken',{token:token})
}   

async function logoutGet(req,res){

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'User already logout!' });
    }

    await User.update({ refreshToken: null }, { where: { refreshToken } });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict'
    });

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict'
    });


    
    return res.redirect('/auth/login');
}



//POST REQUESTS============================
async function loginPost(req,res){


    const {username,password} = req.body;
    const checkRateLimit = await checkLoginLimit(username)
    if(checkRateLimit.tries===5){
        console.error('[-] Rate limit exceeded for user:', username);
        return res.status(409).json({
            message:'Rate limit my brother'
        })
    }
    
    if(!username || !password){
        return res.status(400).json({message:'Username and password are required'});
    }

    if(typeof username!=="string"){
        return res.status(400).json({ message: 'Invalid input type' });
    }

    const user = await User.findOne({where:{username}})
    if(!user){
        return res.status(404).json({
            message:'User not found!'
        })
    }

    try{
        const isMatch  = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(401).json({
                message:'User or password is incorrect!'
            })
        }

        const accessToken = jwt.sign(
            {
            userId:user.id,
            username:user.username,
            tokenVersion:user.tokenVersion
            },process.env.JWT_SECRET_KEY,{
            expiresIn:'15m',
            algorithm:'HS256'
        })

        const refreshToken = jwt.sign({userId:user.id},process.env.SECRET_TOKEN_KEY,{
            expiresIn:'7d',
            algorithm:'HS256'
        })

        await User.update({ refreshToken }, { where: { id: user.id } });

        req.user = user;

        return res
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000 
        })
        .status(200)
        .json({
            message:'Login successful!',
            redirectTo:'/blogs',
            token:accessToken
        })

    }
    catch (err){
        return res.status(500).json({
            message: 'Server error during password check!'
        });
    }


}

async function registerPost(req,res){
    const {username,email,password,confirmPassword} = req.body;
    let isAdmin;

    if(!username || !email || !password || !confirmPassword){
        return res.status(400).json({message:'Username, email and password are required'});
    }

    if(typeof username!=="string" || typeof email!=="string"){
        return res.status(400).json({ message: 'Invalid input type' });
    }

    const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;;
    if(!emailRegex.test(email)){
        return res.status(400).json({message:'Invalid email format'});
    }
    
    const validatedUsername = validateUserInput(username);

    if(validatedUsername.status === 'error'){
        console.error(validatedUsername.message);
        return res.status(400).json({message:'Invalid characters in username'});
    }
    

    if(password !== confirmPassword){
        return res.status(400).json({message:'Passwords do not match!'});
    }
    
    try{
        const checkUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if(process.env.ENVIRONMENT==="dev" && email==="admin@gmail.com"){
            isAdmin=true
        }

        if(checkUser){
            return res.status(400).json({
                message:'User already exists!'
            })
        }

        const hashedPassword = bcrypt.hashSync(password,10);
        const newUser = new User({
            username:username,
            email:email,
            password:hashedPassword,
            'isAdmin':isAdmin || false,
            tokenVersion:0
            })

        newUser.save()

        return res.status(201).json({
            message:'User registered successfully!'
        })
    }
    catch(err){
        return res.status(500).json({
            message: 'Error Ocurred during registration!',
            error: err.message
            
        });
    }
    
}

async function resetPasswordPost(req,res){
    const {email} = req.body;

    if(!email){
        return res.status(400).json({message:'Email is required'});
    }

    if(typeof email!=="string"){
        return res.status(400).json({ message: 'Invalid input type' });
    }

    const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
    

    try{
        if(!emailRegex.test(email)){
            return res.status(400).json({message:'Invalid email format'});
        }

        const user = await User.findOne({where:{email}})
        if(!user){
            return res.status(200).json({
                message:'Password reset token generated successfully.Check your email for further instructions.'
            })
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expireAt = new Date(Date.now() + 3600000);
        const existingToken = await ResetToken.findOne({where:{userId:user.id}})

        if(existingToken){
            await existingToken.update({
                token:resetToken,
                expireAt:expireAt
            })
        }
        else{
            await ResetToken.create({
                token:resetToken,
                expireAt:expireAt,
                userId: user.id
            });
        }


        var checkMailStatus = await postTokenToMail(email,resetToken);

        if(checkMailStatus.status === 'error'){
            return res.status(500).json({
                message:'Error sending email. Please try again later.'
            })
        }

        return res.status(200).json({
            message:'Password reset token generated successfully.Check your email for further instructions.'
        })
    }
    catch(err){
        return res.status(500).json({
            message: 'Server error during password reset!',
            error: err.message
    })}
   
    

    


}

async function resetTokenPost(req,res){

    const {token} = req.params;
    const {email,newPassword} = req.body;

    if(!token || !email || !newPassword){
        return res.status(400).json({message:'Token, email and new password are required'});
    }

    if(typeof token!=="string" && typeof email!=="string"){
        return res.status(400).json({ message: 'Invalid input type' });
    }


    if(newPassword.length < 6){
        return res.status(400).json({message:'Password must be at least 6 characters long'});
    }
    

    const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;

    try{
        if(!emailRegex.test(email)){
            return res.status(400).json({message:'Invalid email format'});
        }

        const user = await User.findOne({where:{email}})
        if(!user){
            return res.status(404).json({
                message:'User with this email not found!'
            })
        }
        
        const checkToken = await ResetToken.findOne({where:{token}})
        if(!checkToken){
            return res.status(400).json({
                message:'Invalid or expired token!'
            })
        }

        if(checkToken.expireAt < new Date()){
            return res.status(400).json({
                message:'Token has expired!'
            })
        }

        if(checkToken.userId !== user.id){
            return res.status(400).json({
                message:'Token does not match the user!'
            })
        }
        
        const hashedPassword = bcrypt.hashSync(newPassword,10);
        user.password = hashedPassword;
        await user.save();

        await ResetToken.destroy({where:{token}})

        return res.status(200).json({
            message:'Password reset successfully!'
        })
    }
    catch(err){
        return res.status(500).json({
            message: 'Server error during password reset!',
            error: err.message
    })
    }

    

}

async function refreshTokenGet(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                message: 'Refresh token is required',
                redirectTo: '/auth/login'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.SECRET_TOKEN_KEY);
        } catch (err) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(403).json({ 
                message: 'Invalid or expired refresh token',
                redirectTo: '/auth/login'
            });
        }

        const user = await User.findOne({ where: { id: decoded.userId } });
        
        if (!user || user.refreshToken !== refreshToken) {
            if (user) {
                await User.update({ refreshToken: null }, { where: { id: user.id } });
            }
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(403).json({ 
                message: 'Invalid refresh token',
                redirectTo: '/auth/login'
            });
        }

        // Yeni token version
        const newTokenVersion = user.tokenVersion + 1;

        // Yeni refresh token
        const newRefreshToken = jwt.sign(
            { userId: user.id },
            process.env.SECRET_TOKEN_KEY,
            { expiresIn: '7d' }
        );

        // Yeni access token
        const accessToken = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                tokenVersion: newTokenVersion
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '15m', algorithm: 'HS256' }
        );

        // DB update
        await User.update(
            { refreshToken: newRefreshToken, tokenVersion: newTokenVersion },
            { where: { id: user.id } }
        );

        // Cookie-ləri set et
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Tokens refreshed successfully',
            token: accessToken
        });

    } catch (err) {
        console.error('[-] Refresh token error:', err.message);
        return res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        });
    }
}

const refreshTokenPost = (req,res)=>{
    res.send('Refresh Token POST Endpoint');
}   


module.exports={
    verifyAdminSessionGet,
    verifySessionGet,
    loginGet,
    resetTokenGet,
    logoutGet,
    registerGet,
    resetPasswordGet,
    refreshTokenPost,
    refreshTokenGet,

    registerPost,
    loginPost,
    resetPasswordPost,
    resetTokenPost,
    refreshTokenPost,

}
