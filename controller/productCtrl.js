const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require('slugify');
const cloudinary = require("../utils/cloudinary");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");
const { json } = require("body-parser");

const createProduct = asyncHandler(async(req, res) => {
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const product = await Product.create(req.body);
        res.json(product);
    }catch(errror){
        throw new Error(errror);
    }
});

const updateProduct = asyncHandler(async(req, res) => {
    const id = req.params;
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate(id, req.body, {new: true,});
        res.json(updateProduct);
    }catch(error){
        throw new Error(error);
    }
   
});

const deleteProduct = asyncHandler(async(req, res) => {
    try{
        const {id} = req.params;
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.json(deleteProduct);
    }catch(error){
        throw new Error(error);
    }
    
});

const getProduct = asyncHandler(async(req, res) => {
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }catch(error){
        throw new Error(error);
    }
});

const getAllProducts = asyncHandler(async(req, res) => {
    try{
        //filtering
        const queryObj = {...req.query};
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));


        //sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }else{
            query = query.sort("-createdAt");
        }

        //limiting fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        }else{
            query = query.select("-__v");
        }


        //pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1)*limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This page deosn't exist.");
        }


        const allProducts = await query;
        res.json(allProducts);
    }catch(error){
        throw new Error(error);
    }
});

const addToWishList = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    const {prodId} = req.body;

    try{
        const user = await User.findById(_id);
        const isAlreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
        if(isAlreadyAdded){
            let user = await User.findByIdAndUpdate(_id, {$pull: {wishlist:prodId}}, {new: true,});
            res.json(user);
        }else{
            let user = await User.findByIdAndUpdate(_id, {$push: {wishlist:prodId}}, {new: true,});
            res.json(user);
        }
    }catch(error){
        throw new Error(error);
    }
});

const rating = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    const {star, prodId, comment} = req.body;
    try{
        const product = await Product.findById(prodId);
        let alreadyRated = await product.ratings.find((userId) => userId.postedBy.toString() === _id.toString());
        if(alreadyRated){
            const updateRatings = await Product.findOne(prodId);
                const updateRating = await Product.findOne(
                    {
                        ratings: {$elemMatch: alreadyRated},
                    },
                    {
                        $set: {"ratings.$.star": star, "ratings.$.comment": comment},
                    },
                    {new: true,}
                );
            }else{
                const rateProd = await Product.findByIdAndUpdate(prodId, {
                    $push:{
                        ratings:{
                            star: star,
                            comment: comment,
                            postedBy: _id,
                        }
                    }
                }, {new: true,});
        }

        const getAllRatings = await Product.findOne(prodId);
        let totalRating = getAllRatings.ratings.length;
        let ratingSum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev+curr, 0);
        let actualRating = Math.round(ratingSum/totalRating);
        let finalProduct = await Product.findByIdAndUpdate(prodId, {
            totalRating: actualRating,
        }, {new: true,});
        res.json(finalProduct);
    }catch(error){
        throw new Error(error);
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

        const findProuct = await Product.findByIdAndUpdate(
            id,
             {
                images: urls.map((file) => {
                    return file;
                }),
            }, {new: true});
            res.json(findProuct);
    }catch(error){
        throw new Error(error);
    }
});


module.exports = {createProduct, getProduct, getAllProducts, 
    updateProduct, deleteProduct, addToWishList, rating, uploadImages};