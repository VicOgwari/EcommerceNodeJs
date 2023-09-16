const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const validateMongoId = require('../utils/validateMongodbId');
const asyncHandler = require('express-async-handler');
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");

const createBlog = asyncHandler(async(req, res) =>{
    try{
        const newBlog = await Blog.create(req.body);
        res.json({status: "Success", newBlog,});
    }catch(error){
        throw new Error(error);
    }
});

const updateBlog = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoId(id);
    try{
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateBlog);
    }catch(error){
        throw new Error(error);
    }
});

const deleteBlog = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoId(id);
    try{
        const deleteBlog = await Blog.findByIdAndDelete(id, req.body);
        res.json({deleteBlog});
    }catch(error){
        throw new Error(error);
    }
});

const getBlog = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoId(id);
    try{
        const theBlog = await Blog.findById(id).populate("likes").populate("dislikes");
        const updateViews = await Blog.findByIdAndUpdate(id, {$inc: {numViews: 1},}, {new: true});
        res.json(theBlog);
    }catch(error){
        throw new Error(error);
    }
});

const getAllBlogs = asyncHandler(async(req, res) => {
    try{
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    }catch(error){
        throw new Error(error);
    }
});

const likeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body;
    validateMongoId(blogId);
    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;
    const isLiked = blog?.isLiked; //has user liked the blog?
    //has user disliked the blog?
    const isDisliked = blog?.dislikes?.find((userId) => userId?.toString() === loginUserId.toString());
    if(isDisliked){
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {dislikes: loginUserId}, isDisliked: false
        }, {new: true});
        res.json(blog);
    }
    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {likes: loginUserId}, isLiked: false
        }, {new: true});
        res.json(blog);
    }else{
        const blog = await Blog.findByIdAndUpdate(id, {
            $push: {likes: loginUserId}, isLiked: true
        }, {new: true});
        res.json(blog);
    }

});

const dislikeBlog = asyncHandler(async(req, res) => {
    const {blogId} = req.body;
    validateMongoId(blogId);
    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;
    const isDisliked = blog?.isDisliked; //has user liked the blog?
    //has user disliked the blog?
    const isLiked = blog?.likes?.find((userId) => userId?.toString() === loginUserId.toString());
    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {likes: loginUserId}, isLiked: false
        }, {new: true});
        res.json(blog);
    }
    if(isDisliked){
        const blog = await Blog.findByIdAndUpdate(id, {
            $pull: {dislikes: loginUserId}, isDisliked: false
        }, {new: true});
        res.json(blog);
    }else{
        const blog = await Blog.findByIdAndUpdate(id, {
            $push: {dislikes: loginUserId}, isDisLiked: true
        }, {new: true});
        res.json(blog);
    }

});

const uploadImages = asyncHandler(async(req, res) => {
    const{id} = req.params;
    validateMongoDbId(id);
    try{
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;
        for(const file of file){
            const{path} = files;
            const newPath = await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }

        const findBlog = await Blog.findByIdAndUpdate(
            id,
             {
                images: urls.map((file) => {
                    return file;
                }),
            }, {new: true});
            res.json(findBlog);
    }catch(error){
        throw new Error(error);
    }
});

module.exports = {createBlog, updateBlog, deleteBlog, getBlog, getAllBlogs, likeBlog, dislikeBlog, uploadImages}
