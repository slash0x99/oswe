const express = require('express')
const router = express.Router()
const indexController = require('../controllers/indexController')

router.get('/',indexController.home)

router.get('/404',indexController.page404)
router.get('/429',indexController.page429)
router.get('/500',indexController.page500)



module.exports=router