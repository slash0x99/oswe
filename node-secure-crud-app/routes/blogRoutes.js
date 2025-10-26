const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const {generateCSRFToken,validateCSRFToken} = require('../middleware/csrfValidator');
const {isAuthenticated,isAdmin} = require('../middleware/authMiddleware');

router.get('/blogs',blogController.getAllBlogsGet)
router.post('/blogs',blogController.getAllBlogsPost)
router.get('/blog/getRecentBlogs',blogController.getRecentBlogs)

router.get('/blog/create',isAuthenticated,generateCSRFToken,blogController.createBlogGet)
router.post('/blog/create',isAuthenticated,validateCSRFToken,blogController.createBlogPost)

router.get('/blog/edit/:uuid',isAuthenticated,generateCSRFToken,blogController.editBlogGet)
router.put('/blog/edit/:uuid',isAuthenticated,isAdmin,validateCSRFToken,blogController.editBlogPost)


router.get('/blog/view/:uuid',generateCSRFToken,blogController.getBlogWithUuidGet)
router.post('/blog/view/:uuid',blogController.getBlogWithUuidPost)
router.delete('/blog/delete/:uuid',isAuthenticated,isAdmin,validateCSRFToken,blogController.deleteBlog)

//COMMENTS
router.post('/blog/comment',isAuthenticated,validateCSRFToken,blogController.postComment)
router.delete('/blog/comment',isAuthenticated,isAdmin,validateCSRFToken,blogController.deleteComment)

module.exports=router