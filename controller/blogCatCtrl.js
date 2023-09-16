const Category = require("../models/blogCatModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBlogCategory = asyncHandler(async(req, res) => {
    try{
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    }catch(error){
        throw new Error(error);
    }
});

const updateBlogCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const updateCat = await Category.findByIdAndUpdate(id, req.body, {new: true,});
        res.json(updateCat);
    }catch(error){
        throw new Error(error);
    }
});

const getBlogCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const getCat = await Category.findById(id);
        res.json(getCat);
    }catch(error){
        throw new Error(error);
    }
});

const getAllBlogCategory = asyncHandler(async(req, res) => {
    try{
        const getAllCat = await Category.find();
        res.json(getAllCat);
    }catch(error){
        throw new Error(error);
    }
});

const deleteBlogCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const deleteCat = await Category.findByIdAndDelete(id);
        res.json(deleteCat);
    }catch(error){
        throw new Error(error);
    }
});

module.exports = {createBlogCategory, updateBlogCategory, deleteBlogCategory, getBlogCategory, getAllBlogCategory};