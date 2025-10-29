const rateLimit = require('express-rate-limit');

const rateLimitPerPage = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,  
    legacyHeaders: false,

});

module.exports = rateLimitPerPage;
