const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({path:'../configs/.env'});

async function postTokenToMail(email,token){
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const baseUrl = process.env.ENVIRONMENT === "dev" 
        ? `http://localhost:3000/auth/reset-token/${token}` 
        : `https://prodenvir.com/auth/reset-token/${token}`;

        let info = await transporter.sendMail({
            from: `"Password reset!`,
            to: email,
            subject: "Password Reset Token",
            text: `You requested a password reset. Use the following token to reset your password: ${token}. This token is valid for 1 hour.`,
            html: `<p>You requested a password reset. Use the following token to reset your password:</p><h3>${token}</h3><a href="${baseUrl}">Link</a><br><p>This token is valid for 1 hour.</p>`
        });
        
        return {
            status: 'success'
        }
    }
    catch (error) {
        return {status: 'error', message: error.message};
    }
    
}


module.exports = postTokenToMail;