import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  getUsersController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

//router object

const router = express.Router();

//routing
//Register
router.post("/register", registerController);

//login
router.post("/login", loginController);

//Forgot password
router.post("/forgot-password", forgotPasswordController);

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

//All orders
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
