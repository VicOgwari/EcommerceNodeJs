const express = require('express');
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, addToWishList, rating, 
    uploadImages } = require('../controller/productCtrl');
const {isAdmin, authMiddleware} = require('../middleware/authMiddleware');
const { uploadPhoto, productImResize } = require('../middleware/uploadImages');
const router = express.Router();
router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/upload/:id", authMiddleware, isAdmin, uploadPhoto.array("images", 10), productImResize, uploadImages)
router.get("/:id", getProduct);
router.get("/", getAllProducts);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.put("/wishlist", authMiddleware, isAdmin, addToWishList);
router.put("/rating", authMiddleware, isAdmin, rating);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;