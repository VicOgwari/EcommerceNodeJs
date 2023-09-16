const express = require("express");
const { createCategory, updateCategory, deleteCategory,
     getAllCategory, getCategory } = require("../controller/prodCategoryCtr");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const catRouter = express.Router();

catRouter.post("/", authMiddleware, isAdmin, createCategory);
catRouter.get("/", getAllCategory);
catRouter.get("/:id", getCategory);
catRouter.put("/:id", authMiddleware, isAdmin, updateCategory);
catRouter.delete("/:id", authMiddleware, isAdmin, deleteCategory);

module.exports = catRouter;