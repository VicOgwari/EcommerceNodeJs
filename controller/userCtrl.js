const User = require('../models/userModel');
const Cart = require("../models/cartModel");
const Product = require("../models/prodCategoryModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const {generateToken} = require('../config/jwtToken');
const {generateRefreshToken} = require('../config/refreshToken');
const { validateId } = require('../utils/validateMongodbId');
const jwt = require('jsonwebtoken');
const uniqid = require("uniqid");
const crypto = require('crypto');
const { sendEmail } = require('./emailCtrl');
const { use } = require('../routes/authRoute');


const createUser = asyncHandler(async (req, res) =>{
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if(!findUser){
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error("User already exists");
    }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email});
    if(findUser && (await findUser.isPasswordMatched(password))){
        const refreshToken = generateRefreshToken(findUser?.id);
        const updateUser = await User.findByIdAndUpdate(findUser.id,
            {
                refreshToken: refreshToken,
            },
            {new: true
            });

        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 72*60*60*1000});
        
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    }else{
        throw new Error("Invalid credentials");
    }
    console.log(email, password);
});

//admin login
const loginAdminCtrl = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const findAdmin = await User.findOne({email});
    if(findAdmin.role !== "admin") throw new Error("Not authorized!");
    if(findAdmin && (await findAdmin.isPasswordMatched(password))){
        const refreshToken = generateRefreshToken(findAdmin?.id);
        const updateUser = await User.findByIdAndUpdate(findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            {new: true
            });

        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 72*60*60*1000});
        
        res.json({
            _id: findAdmin?._id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    }else{
        throw new Error("Invalid credentials");
    }
    console.log(email, password);
});

//get all users
const getAllUsers = asyncHandler(async (req, res) => {
    try{
        const allUsrs = await User.find();
        res.json(allUsrs);
    }catch(error){
        throw new Error(error);
    }
});

//get single user
const getUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateId(id);
    try{
        const theUser = await User.findById(id);
        res.json({
            theUser,
        });
    }catch(error){
        throw new Error(error);
    }
});

//delete single user
const delUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateId(id);
    try{
        const theUser = await User.findByIdAndDelete(id);
        res.json({
            theUser,
        });
    }catch(error){
        throw new Error(error);
    }
});

//update user
const updatedUser = asyncHandler(async (req, res) => {
    const{_id} = req.user;
    validateId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id, {
            firstName: req?.body?.firstName,
            lastname: req?.body?.lastName,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        }, {
            new: true,
        });

        res.json(updateUser);
    }catch(error){
        throw new Error(error);
    }
});

const handleRefreshToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies.");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("No refresh token in db or no user.");
    jwt.verify(refreshToken, process.JWT_SECRET, (err, decoded) => {
        if(err || user.id !== decoded.id){
            throw new Error("Something's wrong with the refresh token");
        }
        const accessToken = generateToken(user._id);
        res.json({accessToken});
    });
});

const logOut = asyncHandler(async(req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies.");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken", {httpOnly: true, secure: true});
        return res.sendStatus(204); //forbidden
    }
    await User.findByIdAndUpdate(refreshToken, {refreshToken: ""});
    res.clearCookie("refreshToken", {httpOnly: true, secure: true});
    res.sendStatus(204); //forbidden
});

const blockUser = asyncHandler(async (req, res) => {
    const {id} = req.user;
    try{
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        }, {
            new: true,
        });
        res.json({
            message: "User blocked"
        });
    }catch(error){
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    const {id} = req.user;
    try{
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        }, {
            new: true,
        });
        res.json({
            message: "User unblocked"
        });
    }catch(error){
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const{_id} = req.user;
    const {password} = req.body;
    validateId(_id);
    const user = await User.findById(_id);
    if(password){
        user.password = password;
        const updatedPassword = await user.save();
        res.json({"message": "Password updated."});
    }else{
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error("No user found with this email.");
    try{
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetUrl = `Hi. Follow this link to reset your password. Link is valid for 10 minutes. <a href = 'http://localhost:5000/api/user/reset-password/${token}'>Click here</>`;
        const data = {
            to: email, 
            text: "Hey user,",
            subject: "Forgot password link",
            htm: resetUrl,
        };
        sendEmail(data);
        res.json(token);
    }catch(error) {
        throw new Error(error);
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()},
    });
    if(!user) throw new Error("Token expired. Try again later");
    user.password = password;
    user.passwordResetToken = undefined,
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});


const getWishList = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    validateId(_id);
    try{
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    }catch(error){
        throw new Error(error);
    }
});

const saveUserAddress = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    validateId(_id);
    try{
        const updateUser = await User.findByIdAndUpdate(_id, {address: req?.body?.address,}, {new: true,});
        res.json(updateUser);
    }catch(error){
        throw new Error(error);
    }
});

const userCart = asyncHandler(async(req, res) => {
    const {cart} = req.body;
    const {_id} = req.user;
    validateId(_id);

    try{
        let products = [];
        const user = await User.findById(_id);
        const alreadyExistsCart = await Cart.findOne({orderBy : user._id});
        if(alreadyExistsCart){
            alreadyExistsCart.remove();
        }
        for(let i = 0; i < cart.length; i++){
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;

            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }

        let cartTotal = 0;
        for(let i = 0; i < products.length; i++){
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderBy: user?._id,
        }).save();
        res.json(newCart);
    }catch(error){
        throw new Error(error);
    }
});

const getUserCart = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    validateId(_id);
    try{
        const cart = await Cart.findOne({orderBy: _id}).populate("products.product");
        res.json(cart);
    }catch(error){
        throw new Error(error);
    }
});

const emptyCart = asyncHandler(async(req, res) => {
    const {_id} = req.user;
    validateId(_id);
    try{
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndRemove({orderBy: user._id});
        res.json(cart);
    }catch(error){
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async(req, res) => {
    const {coupon} = req.body;
    const {_id} = req.user;
    validateId(_id);
    const validCoupon = await Coupon.findOne({name: coupon});
    if(validCoupon === null){ throw new Error("No such coupon!");}
    const user = await User.findOne((_id));
    let{products, cartTotal} = await Cart.findOne({
        orderBy: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (cartTotal - (cartTotal*validCoupon.discount) / 100).toFixed(2);
    await Cart.findOneAndUpdate(
        {orderBy: user._id},
        {totalAfterDiscount},
        {new: true},
    );
    res.json(totalAfterDiscount);
    try{

    }catch(error){
        throw new Error(error);
    }
});

const createOrder = asyncHandler(async(req, res) => {
    const {COD, couponApplied} = req.body;
    const {_id} = req.user;
    validateId(_id);
    try{
        if(!COD) throw new Error("Cash order creation failed!.");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({orderBy: user._id});
        let finalAmount = 0;
        if(couponApplied && userCart.totalAfterDiscount){
            finalAmount = userCart.totalAfterDiscount;
        }else{
            finalAmount = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderBy: user._id,
            orderStatus: "Cash on Delivery",
        }).save();

        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: {_id: item.product._id},
                    update: {$inc: {quantity: -item.count, sold: +item.count}},
                },
            };
        });

        const updateProduct = await Product.bulkWrite(update, {});
        res.json({message: "success"});

    }catch(error){
        throw new Error(error);
    }
});

const getOrders = asyncHandler(async(req, res) => {
    const {_id} = req.user();
    validateId(_id);
    try{
        const userOrders = await Order.findOne({orderBy: _id}).populate("products.product").exec();
        res.json(userOrders);
    }catch(error){
        throw new Error(error);
    }
});


const updateOrderStatus = asyncHandler(async(req, res) => {
    const {status} = req.body;
    const{id} = req.params;
    validateId(id);
    try{
        const updateOrderStatus = await Order.findByIdAndUpdate(id,
            {
                orderStatus: status,
                paymentIntent:{
                    status: status,
                },
            },
            {new: true,}
        );
    
        res.json(updateOrderStatus);
    }catch(error){
        throw new Error(error);
    }
});
module.exports = {createUser, loginUserCtrl, getAllUsers, getUser, delUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword, loginAdminCtrl, getWishList, saveUserAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus};