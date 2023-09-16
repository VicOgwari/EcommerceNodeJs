const express = require('express');
const { createBlog, updateBlog, deleteBlog, 
    getBlog, getAllBlogs, likeBlog, dislikeBlog, uploadImages } = require('../controller/blogCtrl');
const { isAdmin, authMiddleware } = require('../middleware/authMiddleware');
const { blogImResize, uploadPhoto } = require('../middleware/uploadImages');
const blogRouter = express.Router();
blogRouter.post("/", authMiddleware, isAdmin, createBlog);
blogRouter.put("/likes", authMiddleware, likeBlog);
blogRouter.put("/dislikes", authMiddleware, dislikeBlog);
blogRouter.put("/:id", authMiddleware, isAdmin, updateBlog);
blogRouter.delete("/:id", authMiddleware, isAdmin, deleteBlog);
blogRouter.get("/:id", getBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.put("/upload/:id", authMiddleware, isAdmin, uploadPhoto.array("images", 10), 
blogImResize, uploadImages)

module.exports = blogRouter;