const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBrand = asyncHandler(async(req, res) => {
    try{
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    }catch(error){
        throw new Error(error);
    }
});

const updateBrand = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const updateCat = await Brand.findByIdAndUpdate(id, req.body, {new: true,});
        res.json(updateCat);
    }catch(error){
        throw new Error(error);
    }
});

const getBrand = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const getCat = await Brand.findById(id);
        res.json(getCat);
    }catch(error){
        throw new Error(error);
    }
});

const getAllBrands = asyncHandler(async(req, res) => {
    try{
        const getAllCat = await Brand.find();
        res.json(getAllCat);
    }catch(error){
        throw new Error(error);
    }
});

const deleteBrand = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const deleteCat = await Brand.findByIdAndDelete(id);
        res.json(deleteCat);
    }catch(error){
        throw new Error(error);
    }
});

module.exports = {createBrand, updateBrand, deleteBrand, getBrand, getAllBrands};