const Blog = require('../models/blogModels')
const jwt = require('jsonwebtoken')
const getTokenFromHeader = require('../middleware/getTokenFromHeader')
const { v4: uuidv4 } = require('uuid');
const { request } = require('express');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


//GET REQUESTS=============================

function getAllBlogsGet(req,res){
    return res.render('blogs/blogs')
}

function getBlogWithUuidGet(req,res){
    return res.render('blogs/blogView',{csrfToken:req.csrfToken})
}

function createBlogGet(req,res){
    return res.render('blogs/blogCreate',{csrfToken:req.csrfToken})
}

function editBlogGet(req,res){
    return res.render('blogs/blogEdit',{csrfToken:req.csrfToken})
} 

async function getRecentBlogs(req,res){
    try{
        const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(6);
        return res.status(200).json({
            'message':'Recent blogs fetched successfully!',
            'blogs':recentBlogs
        })
    }   catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server error' });  
    }
}


//POST REQUESTS============================

async function getAllBlogsPost(req,res){
    try{
        const allBlogs = await Blog.find()
        return res.status(200).json({
            'message':"All Blogs Fetched!",
            "blogs":allBlogs
        })
    }
    catch (error)
    {   
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }


}

async function getBlogWithUuidPost(req,res){

    const uuid = req.params.uuid

    if(!uuid){
        console.error('UUID param is missing!');
        return res.status(400).json({
            'message':'UUID param is missing!',
            'blog':null
        })
    }

    if(typeof uuid!=="string"){
        console.error('Invalid input type for UUID!');
        return res.status(400).json({ message: 'Invalid input type' });
    }

    try{

        const blog = await Blog.findOne({"uuid":uuid})
        if(blog===null){
            console.error('Blog not found!');
            return res.status(404).json({
                'message':'Blog not found!',
                'blog':null
            })
        }
        return res.status(200).json({
                'message':'Data successfuly fetched!',
                'blog':blog
            })
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server error' });  
    }
   
}

async function createBlogPost(req,res){
    const {
        title,
        content,
        imageUrl
    } = req.body

    

    if(!title || !content || !imageUrl){
        console.error('All fields are required!');
        return res.status(400).json({
            message:'All fields are required!'
        })
    }

    if(typeof title!=="string"
        && typeof content!=="string"
        && typeof imageUrl!=="string"
    ){
        console.error('Invalid input type!');
        return res.status(400).json({ message: 'Invalid input type' });
    }

    if(title.length<5){
        console.error('Title must be at least 5 characters long!');
        return res.status(400).json({
            message:'Title must be at least 5 characters long!'
        })
    }

    if(req.user===undefined){
        console.error('Unauthorized access attempt!');
        return res.status(401).json({
            message:'Unauthorized!'
        })
    }

    const user = req.user


    var author = {
        'id':user.id,
        'username':user.username,
        'email':user.email
    }

    const sanitizedTitle = DOMPurify.sanitize(title);
    let sanitizedContent = DOMPurify.sanitize(content);
    let sanitizedContentHtmlEncoded = sanitizedContent.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#39;').replace('javascript:', '');
    sanitizedContent = sanitizedContentHtmlEncoded;
    
    if(imageUrl.includes('<') 
        || imageUrl.includes('>') 
        || imageUrl.includes('"') 
        || imageUrl.includes("'")
        || imageUrl.includes('javascript:')
    ){
        console.error('Invalid image URL detected!');
        return res.status(400).json({
            message:'Invalid image URL!'
        })
    }


    const userData = {
        'uuid':uuidv4(),
        'title':sanitizedTitle,
        'content':sanitizedContent,
        'imageUrl':imageUrl,
        'author':author
    }

    try{
        const newBlog = new Blog(userData)
        newBlog.save()

        return res.status(201).json({
            message:'Successfuly Created!',
            'redirectUrl': '/blog/view/' + userData.uuid
        })
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server error' });  
    }

}  

async function editBlogPost(req,res){
    try {
        const uuid = req.params.uuid;
        const { title, content, imageUrl } = req.body;

        if (!title || !content || !imageUrl) {
            console.error('All fields are required for editing!');
            return res.status(400).json({ message: 'All fields are required!' });
        }

        if(    typeof title!=="string"
            && typeof content!=="string"
            && typeof imageUrl!=="string"
            && typeof uuid!=="string"
        ){
            return res.status(400).json({ message: 'Invalid input type' });
        }

        const blog = await Blog.findOne({ uuid });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found!' });
        }

        let sanitizedContent = DOMPurify.sanitize(content);
        let sanitizedContentHtmlEncoded = sanitizedContent.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#39;').replace('javascript:', '');
        sanitizedContent = sanitizedContentHtmlEncoded;
            
        const sanitizedTitle = DOMPurify.sanitize(title);
        if(imageUrl.includes('<') 
            || imageUrl.includes('>') 
            || imageUrl.includes('"') 
            || imageUrl.includes("'")
            || imageUrl.includes('javascript:')
        ){
            return res.status(400).json({
                'message':'Invalid image URL!'
            })
        }

        if (title) blog.title = sanitizedTitle;
        if (content) blog.content = sanitizedContent;
        if (imageUrl) blog.imageUrl = imageUrl;

        await blog.save();

        res.status(200).json({
            message: 'Blog updated successfully!',
            blog
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }


}

async function deleteBlog(req,res){
    try {
        const uuid = req.params.uuid;
        if (!uuid) {
            console.error('UUID param is missing!');
            return res.status(400).json({ message: 'UUID param is missing!' });
        }

        if(typeof uuid!=="string"){
            console.error('Invalid input type for UUID!');
            return res.status(400).json({ message: 'Invalid input type' });
        }

        const blog = await Blog.findOne({ uuid });
        if (!blog) {
            console.error('Blog not found for deletion!');
            return res.status(404).json({ message: 'Blog not found!' });
        }

        await blog.deleteOne();
        res.status(200).json({ message: 'Blog deleted successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
    
}



//COMMENTS
async function postComment(req,res){

    try{
        const {text,uuid} = req.body
        if(typeof text!=="string"
            && typeof uuid!=="string"
        ){
            console.error('Invalid input type for commenting!');
            return res.status(400).json({ message: 'Invalid input type' });
        }

        if(!text || !uuid){
            console.error('All fields are required for commenting!');
            return res.status(400).json({
                'message':'All fields are required for commenting!'
            })
        }


        if(req.user===undefined){  
            console.error('Unauthorized access attempt for commenting!'); 
            return res.status(401).json({
                'message':'Unauthorized!'
            })
        }

        const user = req.user
        const username = user.username  



        const comment = {
            'text':text,
            'username':username,
            'commentId':uuidv4()
        }

        const blog = await Blog.findOne({'uuid':uuid})
        if(!blog){
            console.error('No blog found for commenting!');
            blog.comments = [];
            return res.status(404).json({
                'message':'No blog found,for commenting.!'
            })
        }

        blog.comments.push(comment)
        await blog.save();

        return res.status(200).json({
            'message':'Comment sent successfuly!'
        })
    }

    catch (error) {
        console.error(error);   
        return res.status(500).json({
            'message':`Err: ${error}`
        })
    }


}

async function deleteComment(req,res){
    try{
        const {uuid,commentId} = req.body
        if(!uuid || !commentId){
            console.error('UUID and CommentId are required for deleting a comment!');   
            return res.status(400).json({
                'message':'UUID and CommentId are required!'
            })
        }

        if(typeof uuid!=="string" && typeof commentId!=="string"){
            console.error('Invalid input type for deleting a comment!');
            return res.status(400).json({ message: 'Invalid input type' });
        }
        

        const blog = await Blog.findOne({'uuid':uuid})
        if(!blog){
            console.error('No blog found for deleting a comment!');
            return res.status(404).json({
                'message':'No blog found!'
            })
        }

        const blogComments = blog.comments

        const existingComment = blogComments.find(c => c.commentId === commentId);

        if (!existingComment) {
            console.error(`No comment found with commentId: ${commentId}`); 
            return res.status(404).json({
                message: `No comment found with commentId: ${commentId}`
            });
        }

        blog.comments = blog.comments.filter(c => c.commentId !== commentId);
        await blog.save();


        return res.status(200).json({
            message: 'Comment removed successfully!'
        });
    }

    catch(err){
        console.error(err); 
        return res.status(500).json({
            'message':`Err: ${err}`
        })
    }
    
}



module.exports={
    getAllBlogsGet,
    getAllBlogsPost,
    getBlogWithUuidGet,
    getBlogWithUuidPost,
    createBlogPost,
    editBlogPost,
    editBlogGet,
    deleteBlog,
    postComment,
    deleteComment,
    getRecentBlogs,
    createBlogGet
}