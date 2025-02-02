import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import { sendOtpToEmail, sendStatusToEmail } from "../helpers/emailUtils.js"; // Import the utility function
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
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
    const { name, email, password, phone, address, answer, otp } = req.body;

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
    if (!address) {
      return res.status(400).send({ message: "Address is required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "Answer is required" });
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
      address,
      answer,
      password: hashedPassword,
    }).save();

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

//forgot password controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(403).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "An Error Occured!",
    });
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
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and must be at least 6 characters",
      });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        address: address || user.address,
        phone: phone || user.phone,
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
    console.log(status);
    //send order status email
    if (status === "Delivered") {
      await sendStatusToEmail(email, orderId, name, status);
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

//test controller
export const testController = (req, res) => {
  res.send("protected route");
};
