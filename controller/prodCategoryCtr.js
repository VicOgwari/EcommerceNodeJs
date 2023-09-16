const ProdCat = require("../models/prodCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCategory = asyncHandler(async(req, res) => {
    try{
        const newCategory = await ProdCat.create(req.body);
        res.json(newCategory);
    }catch(error){
        throw new Error(error);
    }
});

const updateCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const updateCat = await ProdCat.findByIdAndUpdate(id, req.body, {new: true,});
        res.json(updateCat);
    }catch(error){
        throw new Error(error);
    }
});

const getCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const getCat = await ProdCat.findById(id);
        res.json(getCat);
    }catch(error){
        throw new Error(error);
    }
});

const getAllCategory = asyncHandler(async(req, res) => {
    try{
        const getAllCat = await ProdCat.find();
        res.json(getAllCat);
    }catch(error){
        throw new Error(error);
    }
});

const deleteCategory = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const deleteCat = await ProdCat.findByIdAndDelete(id);
        res.json(deleteCat);
    }catch(error){
        throw new Error(error);
    }
});

module.exports = {createCategory, updateCategory, deleteCategory, getCategory, getAllCategory};