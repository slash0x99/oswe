const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const {isAuthenticated,isAdmin} = require('../middleware/authMiddleware');
const rateLimitPerPage = require('../middleware/rateLimitPerPage');


router.get('/verifySession',rateLimitPerPage,isAuthenticated,authController.verifySessionGet)
router.get('/verifyAdminSessionGet',rateLimitPerPage,isAuthenticated,isAdmin,authController.verifyAdminSessionGet)

router.get('/login',rateLimitPerPage,authController.loginGet)
router.post('/login',rateLimitPerPage,authController.loginPost)
router.get('/register',rateLimitPerPage,authController.registerGet)
router.post('/register',rateLimitPerPage,authController.registerPost)
router.get('/resetPassword',rateLimitPerPage,authController.resetPasswordGet)
router.post('/resetPassword',rateLimitPerPage,authController.resetPasswordPost)
router.get('/reset-token/:token',rateLimitPerPage,authController.resetTokenGet)
router.post('/reset-token/:token',rateLimitPerPage,authController.resetTokenPost)
router.get('/logout',rateLimitPerPage,authController.logoutGet)
router.get('/refresh-token',rateLimitPerPage,authController.refreshTokenGet)


module.exports=router