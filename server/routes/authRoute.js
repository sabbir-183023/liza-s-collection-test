import express from "express";
import {
  registerController,
  loginController,
  testController,
  getUsersController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  sendOtpController,
  verifyOtpController,
  getWishlist,
  removeFromWishlist,
  addToWishlist,
  getSingleOrder,
  changePasswordController,
  sendOtpForResetController,
  verifyOtpForResetController,
  resetPasswordController,
} from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

//router object

const router = express.Router();

//routing
//Register
router.post("/register", registerController);

// Route to send OTP
router.post("/send-otp", sendOtpController);

// Route to verify OTP
router.post("/verify-otp", verifyOtpController);

//login
router.post("/login", loginController);

// Change Password Route (Protected)
router.post("/change-password", requireSignIn, changePasswordController);


// Forgot Password Routes
router.post("/send-otp-reset", sendOtpForResetController);
router.post("/verify-otp-reset", verifyOtpForResetController);
router.post("/reset-password", resetPasswordController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected user auth route
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected admin auth route
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//get all users
router.get("/users", requireSignIn, isAdmin, getUsersController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//All orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

//Get Single Order
router.get("/order/:id", requireSignIn, getSingleOrder);

//All orders
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

// Add to wishlist
router.post("/:userId/wishlist", addToWishlist);

// Remove from wishlist
router.delete("/:userId/wishlist", removeFromWishlist);

// Get wishlist
router.get("/:userId/wishlist", getWishlist);

export default router;
