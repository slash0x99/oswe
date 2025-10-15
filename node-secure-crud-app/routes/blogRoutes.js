const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')

router.get('/blogs',blogController.getAllBlogs)
router.get('/blog/:uuid',blogController.getBlogWithUuid)
router.post('/blog/create',blogController.createBlog)
router.put('/blog/edit/:uuid',blogController.editBlog)
router.delete('/blog/delete/:uuid',blogController.deleteBlog)

//COMMENTS
router.post('/blog/comment',blogController.postComment)
router.delete('/blog/delete/comment/:uuid',blogController.deleteComment)

module.exports=router