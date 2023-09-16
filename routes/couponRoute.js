const express = require("express");
const {createCoupon, updateCoupon, deleteCoupon, getCoupon, getAllCoupons} = require("../controller/couponCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const couponRouter = express.Router();

couponRouter.post("/", authMiddleware, isAdmin, createCoupon);
couponRouter.put("/", authMiddleware, isAdmin, updateCoupon);
couponRouter.delete("/:id", authMiddleware, isAdmin, deleteCoupon);
couponRouter.get("/:id", authMiddleware, isAdmin, getCoupon);
couponRouter.get("/", authMiddleware, isAdmin, getAllCoupons);

module.exports = couponRouter;