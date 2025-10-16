const Blog = require('../models/blogModels')
const jwt = require('jsonwebtoken')
const getTokenFromHeader = require('../middleware/getTokenFromHeader')
const { v4: uuidv4 } = require('uuid');
const test = require('node:test');



async function getAllBlogs(req,res){
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

async function getBlogWithUuid(req,res){
    const uuid = req.params.uuid

    const blog = await Blog.findOne({"uuid":uuid})
    if(blog===null){
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

async function createBlog(req,res){
    const {
        title,
        content,
        imageUrl
    } = req.body
    var author = {
        'id':12122,
        'username':'blogUser1',
        'email':'bloguser1@gmail.com'
    }


    const userData = {
        'uuid':uuidv4(),
        'title':title,
        'content':content,
        'imageUrl':imageUrl,
        'author':author
    }

    
    //const jwtToken = getTokenFromHeader(req)


    const newBlog = new Blog(userData)
    newBlog.save()

    return res.status(201).json({
        'message':'Successfuly Created!'
    })


}


async function editBlog(req,res){
    try {
        const uuid = req.params.uuid;
        const { title, content, imageUrl } = req.body;

        const blog = await Blog.findOne({ uuid });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found!' });
        }

        if (title) blog.title = title;
        if (content) blog.content = content;
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

        const blog = await Blog.findOne({ uuid });
        if (!blog) {
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
        var username = 'test'

        const comment = {
            'text':text,
            'username':username,
            'commentId':uuidv4()
        }

        const blog = await Blog.findOne({'uuid':uuid})
        if(!blog){
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
        return res.status(500).json({
            'message':`Err: ${error}`
        })
    }


}

async function deleteComment(req,res){
    try{
        console.log('deng')
        const {uuid,commentId} = req.body
        const blog = await Blog.findOne({'uuid':uuid})
        if(!blog){
            return res.status(404).json({
                'message':'No blog found!'
            })
        }

        const blogComments = blog.comments

        const existingComment = blogComments.find(c => c.commentId === commentId);

        if (!existingComment) {
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
        return res.status(500).json({
            'message':`Err: ${err}`
        })
    }
    
}



module.exports={getAllBlogs,getBlogWithUuid,createBlog,editBlog,deleteBlog,postComment,deleteComment}