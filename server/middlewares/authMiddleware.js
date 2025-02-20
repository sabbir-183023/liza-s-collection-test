import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Token based protected routes
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Authentication token is missing"
      });
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        success: false,
        message: "jwt expired"  // Specific message for expired token
      });
    }

    // For other errors, you can send a general message
    return res.status(401).send({
      success: false,
      message: "Invalid or malformed token"
    });
  }
};

// Admin access
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access"
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "You are not an admin"
    });
  }
};
