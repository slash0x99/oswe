const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const {generateCSRFToken,validateCSRFToken} = require('../middleware/csrfValidator');
const {isAuthenticated,isAdmin} = require('../middleware/authMiddleware');
const rateLimitPerPage = require('../middleware/rateLimitPerPage');

router.get('/blogs',rateLimitPerPage,blogController.getAllBlogsGet)
router.post('/blogs',rateLimitPerPage,blogController.getAllBlogsPost)
router.get('/blog/getRecentBlogs',rateLimitPerPage,blogController.getRecentBlogs)

router.get('/blog/create',rateLimitPerPage,isAuthenticated,generateCSRFToken,blogController.createBlogGet)
router.post('/blog/create',rateLimitPerPage,isAuthenticated,validateCSRFToken,blogController.createBlogPost)

router.get('/blog/edit/:uuid',rateLimitPerPage,isAuthenticated,generateCSRFToken,blogController.editBlogGet)
router.put('/blog/edit/:uuid',rateLimitPerPage,isAuthenticated,isAdmin,validateCSRFToken,blogController.editBlogPost)


router.get('/blog/view/:uuid',rateLimitPerPage,generateCSRFToken,blogController.getBlogWithUuidGet)
router.post('/blog/view/:uuid',rateLimitPerPage,blogController.getBlogWithUuidPost)
router.delete('/blog/delete/:uuid',rateLimitPerPage,isAuthenticated,isAdmin,validateCSRFToken,blogController.deleteBlog)

//COMMENTS
router.post('/blog/comment',rateLimitPerPage,isAuthenticated,validateCSRFToken,blogController.postComment)
router.delete('/blog/comment',rateLimitPerPage,isAuthenticated,isAdmin,validateCSRFToken,blogController.deleteComment)

module.exports=router