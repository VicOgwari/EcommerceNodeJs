const express = require("express");
const { createBlogCategory,
     updateBlogCategory,
      deleteBlogCategory,
       getAllBlogCategory, getBlogCategory } = require("../controller/blogCatCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const catRouter = express.Router();

catRouter.post("/", authMiddleware, isAdmin, createBlogCategory);
catRouter.get("/", getAllBlogCategory);
catRouter.get("/:id", getBlogCategory);
catRouter.put("/:id", authMiddleware, isAdmin, updateBlogCategory);
catRouter.delete("/:id", authMiddleware, isAdmin, deleteBlogCategory);

module.exports = catRouter;