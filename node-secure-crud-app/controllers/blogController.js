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
function postComment(req,res){
    return res.send('ok')
}

function deleteComment(req,res){
    return res.send('ok')
}



module.exports={getAllBlogs,getBlogWithUuid,createBlog,editBlog,deleteBlog,postComment,deleteComment}