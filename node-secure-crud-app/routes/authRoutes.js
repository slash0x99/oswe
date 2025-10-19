const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const {isAuthenticated,isAdmin} = require('../middleware/authMiddleware');


router.get('/verifySession',isAuthenticated,authController.verifySessionGet)
router.get('/verifyAdminSessionGet',isAuthenticated,isAdmin,authController.verifyAdminSessionGet)

router.get('/login',authController.loginGet)
router.post('/login',authController.loginPost)
router.get('/register',authController.registerGet)
router.post('/register',authController.registerPost)
router.get('/resetPassword',authController.resetPasswordGet)
router.post('/resetPassword',authController.resetPasswordPost)
router.get('/reset-token/:token',authController.resetTokenGet)
router.post('/reset-token/:token',authController.resetTokenPost)
router.get('/logout',authController.logoutGet)
router.post('/refresh-token',authController.refreshTokenPost)



module.exports=router