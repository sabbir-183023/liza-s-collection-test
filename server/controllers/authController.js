import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import {
  sendOtpToEmail,
  sendStatusToEmail,
  sendForgotOtpToEmail,
  sendContactEmail,
} from "../helpers/emailUtils.js"; // Import the utility function
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import TransactionModel from "../models/transactionModel.js";
import Newsletter from "../models/newsletterModel.js";
import productModel from "../models/productModel.js";
import JWT from "jsonwebtoken";

// Endpoint to send OTP
export const sendOtpController = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists, Please login",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP

    // Send OTP to the user's email
    await sendOtpToEmail(email, otp);

    // Store OTP temporarily in memory (this can be replaced with Redis or a database)
    global.otpCache = global.otpCache || {};
    global.otpCache[email] = otp;

    res.send({ success: true, message: "OTP sent to your email!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP." });
  }
};

// Endpoint to verify OTP
export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (global.otpCache[email] === parseInt(otp)) {
      return res.send({ success: true, message: "OTP verified successfully!" });
    } else {
      return res.send({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ success: false, message: "Error verifying OTP." });
  }
};

//registration
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }
    if (!phone) {
      return res.status(400).send({ message: "Phone Number is required" });
    }
    if (!otp) {
      return res.status(400).send({ message: "OTP is required" });
    }

    // Check if OTP is verified
    if (!global.otpCache || global.otpCache[email] !== parseInt(otp)) {
      return res.status(400).send({
        success: false,
        message: "Invalid or unverified OTP.",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Save the user
    const user = await new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
    }).save();

    // Save new subscriber
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    // Clear OTP cache for the user after successful registration
    delete global.otpCache[email];

    res.status(201).send({
      success: true,
      message: "User Registration Successful!",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

//login function
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(402).send({
        success: false,
        message: "User does not exist",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Login Successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        district: user.district,
        country: user.country,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//Change Password
export const changePasswordController = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validation
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check if old password matches
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Incorrect old password",
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send({
      success: false,
      message: "Error changing password",
      error,
    });
  }
};

//FORGOT PASSWORD FUCTIONALITY
//send otp to reset password
export const sendOtpForResetController = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP

    // Send OTP to the user's email
    await sendForgotOtpToEmail(email, otp);

    // Store OTP temporarily in memory (you can use Redis for better security)
    global.otpCache = global.otpCache || {};
    global.otpCache[email] = otp;

    res.send({ success: true, message: "OTP sent for password reset!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP." });
  }
};

//verify otp to reset password
export const verifyOtpForResetController = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (global.otpCache[email] === parseInt(otp)) {
      return res.send({ success: true, message: "OTP verified successfully!" });
    } else {
      return res.status(400).send({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ success: false, message: "Error verifying OTP." });
  }
};

//reset password after otp verification
export const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    // Check OTP
    if (!global.otpCache || global.otpCache[email] !== parseInt(otp)) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    await userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    // Clear OTP cache after successful password reset
    delete global.otpCache[email];

    res.status(200).send({
      success: true,
      message: "Password reset successful!",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .send({ success: false, message: "Error resetting password." });
  }
};

//get all users
export const getUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "All Users ",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "An Error Occured!",
    });
  }
};

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, address, phone, district, country } = req.body;
    const user = await userModel.findById(req.user._id);

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        address: address || user.address,
        phone: phone || user.phone,
        district: district || user.district,
        country: country || user.country,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully!",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in updating profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in getting orders",
      error,
    });
  }
};

//All orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("buyer")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in getting orders",
      error,
    });
  }
};

//get single order
export const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id).populate("buyer");
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in getting order",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderModel.findById(orderId).populate("buyer");
    const name = order?.buyer?.name;
    const email = order?.buyer?.email;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    //send order status email
    if (status === "Delivered") {
      await sendStatusToEmail(email, orderId, name, status);
    }
    if (status === "Cancelled") {
      await TransactionModel.findOneAndDelete({ orderId });
    }
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in updating status",
      error,
    });
  }
};

//add to wishlist
export const addToWishlist = async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishList.includes(productId)) {
      user.wishList.push(productId);
      await user.save();
      return res.status(200).send({
        success: true,
        message: "Product added to wishlist",
        wishList: user.wishList,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "Product already in wishlist",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server error",
      error,
    });
  }
};

// remove from wishList
export const removeFromWishlist = async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user)
      return res.status(404).send({
        success: false,
        message: "User not found",
      });

    user.wishList = user.wishList.filter((id) => id.toString() !== productId);
    await user.save();
    return res.status(200).send({
      success: true,
      message: "Product removed from wishlist",
      wishList: user.wishList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server error",
      error,
    });
  }
};

// get wishList
export const getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userModel.findById(userId).populate("wishList");
    if (!user)
      return res.status(404).send({
        success: false,
        message: "User not found",
      });

    return res.status(200).send({
      success: true,
      wishList: user.wishList,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server error",
      error,
    });
  }
};

//send contact message
export const contactMessageController = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    await sendContactEmail(name, email, phone, subject, message);
    res.status(200).send({
      success: true,
      message: "Message Submitted Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "server error",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  res.send("protected route");
};
