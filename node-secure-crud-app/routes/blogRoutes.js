const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const {isAuthenticated,isAdmin} = require('../middleware/authMiddleware');

router.get('/blogs',blogController.getAllBlogsGet)
router.post('/blogs',blogController.getAllBlogsPost)
router.get('/blog/getRecentBlogs',blogController.getRecentBlogs)

router.get('/blog/create',isAuthenticated,blogController.createBlogGet)
router.post('/blog/create',isAuthenticated,blogController.createBlogPost)

router.get('/blog/edit/:uuid',blogController.editBlogGet)
router.put('/blog/edit/:uuid',isAuthenticated,isAdmin,blogController.editBlogPost)


router.get('/blog/view/:uuid',blogController.getBlogWithUuidGet)
router.post('/blog/view/:uuid',blogController.getBlogWithUuidPost)
router.delete('/blog/delete/:uuid',isAuthenticated,isAdmin,blogController.deleteBlog)

//COMMENTS
router.post('/blog/comment',isAuthenticated,blogController.postComment)
router.delete('/blog/comment',isAuthenticated,isAdmin,blogController.deleteComment)

module.exports=router