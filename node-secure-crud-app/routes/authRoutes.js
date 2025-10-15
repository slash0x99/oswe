const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/login',authController.loginGet)
router.post('/login',authController.loginPost)
router.get('/register',authController.registerGet)
router.post('/register',authController.registerPost)
router.get('/resetPassword',authController.resetPasswordGet)
router.post('/resetPassword',authController.resetPasswordPost)
router.post('/reset-token/:token',authController.resetTokenPost)


module.exports=router