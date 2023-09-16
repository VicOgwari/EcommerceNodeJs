const express = require('express');
const { createUser, loginUserCtrl, getAllUsers, getUser, delUser,
     updatedUser, handleRefreshToken, logOut, updatePassword,
      forgotPasswordToken, resetPassword, blockUser, unblockUser, loginAdminCtrl, getWishList, saveUserAddress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();


router.get("/all-users", getAllUsers);
router.get("/:id", authMiddleware, isAdmin, getUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logOut);
router.get("/wishlist", authMiddleware, getWishList);
router.get("/cart", authMiddleware, getUserCart);
router.get("/get-orders", authMiddleware, getOrders);

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/apply-coupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.post("/admin-login", loginAdminCtrl);
router.post("/forgot-password-token", forgotPasswordToken);

router.put("/reset-password/:token", resetPassword);
router.put("/edit-user", authMiddleware, updatedUser);
router.put("/save-address", authMiddleware, saveUserAddress);
router.put("/password", authMiddleware, updatePassword);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);

router.delete("/:id", delUser);
router.delete("/empty-cart", authMiddleware, emptyCart);

module.exports = router;