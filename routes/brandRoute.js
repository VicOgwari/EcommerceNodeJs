const express = require("express");
const { createBrand, updateBrand, deleteBrand, 
    getAllBrands, getBrand } = require("../controller/brandCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const catRouter = express.Router();

catRouter.post("/", authMiddleware, isAdmin, createBrand);
catRouter.get("/", getAllBrands);
catRouter.get("/:id", getBrand);
catRouter.put("/:id", authMiddleware, isAdmin, updateBrand);
catRouter.delete("/:id", authMiddleware, isAdmin, deleteBrand);

module.exports = catRouter;