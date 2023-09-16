const Coupon = require("../models/couponModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async(req, res) => {
    try{
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    }catch(error){
        throw new Error(error);
    }   

});

const updateCoupon = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const updateCat = await Coupon.findByIdAndUpdate(id, req.body, {new: true,});
        res.json(updateCat);
    }catch(error){
        throw new Error(error);
    }
});

const getCoupon = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const getCat = await Coupon.findById(id);
        res.json(getCat);
    }catch(error){
        throw new Error(error);
    }
});

const getAllCoupons = asyncHandler(async(req, res) => {
    try{
        const getAllCat = await Coupon.find();
        res.json(getAllCat);
    }catch(error){
        throw new Error(error);
    }
});

const deleteCoupon = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try{
        const deleteCat = await Coupon.findByIdAndDelete(id);
        res.json(deleteCat);
    }catch(error){
        throw new Error(error);
    }
});


module.exports = {createCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon};