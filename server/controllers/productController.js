import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import dotenv from "dotenv";
import braintree from "braintree";
import fs from "fs";
import { sendOrderCorfirmationToEmail } from "../helpers/emailUtils.js";
import userModel from "../models/userModel.js";
import TransactionModel from "../models/transactionModel.js";
import inventoryModel from "../models/inventoryModel.js";
import Review from "../models/reviewModel.js";
import mongoose from "mongoose";

dotenv.config();

// Cloudinary configuration

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//braintree config for payment

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHENT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//create product
export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      sellingPrice,
      originalPrice,
      category,
      inventory,
      quantity,
      colors,
    } = req.body;

    // Validation
    switch (true) {
      case !name:
        return res.status(501).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !sellingPrice:
        return res.status(500).send({ error: "Selling Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !inventory:
        return res.status(500).send({ error: "Inventory is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case !colors:
        return res.status(500).send({ error: "Colors is Required" });
      case !req.files || req.files.length === 0:
        return res.status(501).send({ error: "Photos are Required" });
    }

    // Upload multiple photos to Cloudinary
    const photoUploads = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "ProductPhotos" })
      )
    );

    // Delete files from local storage after upload
    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.log("Error deleting file from local storage:", err);
      });
    });

    // Create an array of photo URLs and public IDs
    const photos = photoUploads.map((upload) => ({
      url: upload.secure_url,
      public_id: upload.public_id,
    }));

    const product = new productModel({
      name,
      slug: slugify(name),
      description,
      sellingPrice,
      originalPrice: originalPrice || "",
      category,
      inventory,
      quantity,
      photos,
      colors,
    });

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error creating product",
    });
  }
};

// get single product by id
export const getSingleProductControllerById = async (req, res) => {
  try {
    const product = await productModel
      .findById({ _id: req.params.pid })
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

//edit product controller

export const editProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      originalPrice,
      sellingPrice,
      category,
      quantity,
      colors,
    } = req.body;

    // Find the product by ID
    const product = await productModel.findById(id);

    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    // Update product details
    product.name = name;
    product.description = description;
    product.originalPrice = originalPrice || "";
    product.sellingPrice = sellingPrice;
    product.category = category;
    product.quantity = quantity;
    product.colors = colors;

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};

//get all photos for update
export const getPhotosController = async (req, res) => {
  try {
    const { id } = req.params;
    const productPhotos = await productModel.findById(id).select("photos");
    res.status(200).send({
      success: true,
      photos: productPhotos.photos,
    });
  } catch (error) {
    console.log(error);
  }
};

//upload single photo while update
export const uploadSinglePhotoController = async (req, res) => {
  try {
    const { productId } = req.params;

    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).send({ error: "Photo is required" });
    }

    // Upload the photo to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "ProductPhotos",
    });

    // Delete the file from local storage after upload
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file from local storage:", err);
      }
    });

    // Construct the photo object
    const photo = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };

    // Save the photo to the product in the database
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $push: { photos: photo } }, // Add the new photo to the `photos` array
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(201).send({
      success: true,
      message: "Photo uploaded and saved to product successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error uploading photo and saving to database",
    });
  }
};

//Delete single photo while update
export const removePhotoController = async (req, res) => {
  try {
    const { productId } = req.params; // Get productId and public_id from the request body
    const { public_id } = req.body;

    if (!productId || !public_id) {
      return res.status(400).send({
        success: false,
        message: "Product ID and Photo Public ID are required.",
      });
    }

    // Find the product
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found.",
      });
    }

    // Check if the photo exists in the product's photos array
    const photoExists = product.photos.some(
      (photo) => photo.public_id === public_id
    );

    if (!photoExists) {
      return res.status(404).send({
        success: false,
        message: "Photo not found in the product.",
      });
    }

    // Remove the photo from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Remove the photo from the product's photos array
    product.photos = product.photos.filter(
      (photo) => photo.public_id !== public_id
    );

    // Save the updated product
    await product.save();

    res.status(200).send({
      success: true,
      message: "Photo removed successfully.",
      product,
    });
  } catch (error) {
    console.error("Error removing photo:", error);
    res.status(500).send({
      success: false,
      message: "Error removing photo.",
      error,
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category")
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

//DELTE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    const { pid } = req.params; // Get product ID from route params
    console.log("Product ID:", pid);

    // Find the product by ID
    const product = await productModel.findById(pid);

    // Check if product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product Found:", product);

    // Delete photos from Cloudinary
    const photoDeletions = await Promise.all(
      product.photos.map((photo) =>
        cloudinary.uploader.destroy(photo.public_id)
      )
    );

    console.log("Cloudinary Deletions:", photoDeletions);

    // Delete the product from the database
    await productModel.findByIdAndDelete(pid);

    res.status(200).send({
      success: true,
      message: "Product and associated photos deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProductController:", error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error: error.message,
    });
  }
};

//product filter
export const productFilterCOntroller = async (req, res) => {
  try {
    const { checked = [], radio } = req.body;
    let args = {};
    if (radio.length === 2) args.price = { $gte: radio[0], $lte: radio[1] };
    if (checked.length > 0) args.category = { $in: checked };
    const products = await productModel.find(args).populate({
      path: "reviews", // Populate the reviews field
      model: "Review", // Specify the Review model
      select: "stars reviewText user", // Select specific fields from the Review model
      populate: {
        path: "user", // Optionally populate user details
        model: "users",
        select: "name email", // Select fields from User model
      },
    });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

//product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in product count",
      error,
    });
  }
};

//product list based on page
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: " An error occured while doing page product finding",
    });
  }
};

//search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in searching product",
    });
  }
};

//related products
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .limit(3)
      .populate("category")
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in getting related products",
      error,
    });
  }
};

//get product by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel
      .find({ category })
      .populate("category")
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
    });
  }
};

//payment controllers
//braintree token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//braintree payment
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((item) => {
      total = total + item.price * item.amount;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );

    // Update product quantities
    for (const item of cart) {
      await productModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.amount } }, // Reduce quantity by the purchased amount
        { new: true }
      );
    }
    //sending email
    const buyerId = req.user._id;
    const user = await userModel.findById(buyerId);
    const name = user.name;
    const email = user.email;
    await sendOrderCorfirmationToEmail(email, name);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in payment",
      error,
    });
  }
};

//COD Delivery
export const codController = async (req, res) => {
  try {
    const { cart } = req.body;
    let total = 0;
    cart.map((item) => {
      total = total + item.sellingPrice * item.amount;
    });

    const order = new orderModel({
      products: cart,
      payment: "cod",
      buyer: req.user._id,
    }).save();

    // Update product quantities in product model
    for (const item of cart) {
      await productModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.amount } }, // Reduce quantity by the purchased amount
        { new: true }
      );
    }

    // Update product quantities in inventory model
    for (const item of cart) {
      await inventoryModel.findByIdAndUpdate(
        item.inventory,
        { $inc: { currentQty: -item.amount } }, // Reduce quantity by the purchased amount
        { new: true }
      );
    }

    const buyerId = req.user._id;
    const orderId = (await order)._id;
    const user = await userModel.findById(buyerId);
    const name = user.name;
    const email = user.email;
    await sendOrderCorfirmationToEmail(email, name, orderId);

    // Create a new transaction entry
    const transaction = await new TransactionModel({
      debitAccounts: [new mongoose.Types.ObjectId("67b181b7e22f8c747e10030b")], // Bank
      creditAccounts: [new mongoose.Types.ObjectId("67b1867baf3a92b604657119")], // Sales
      amount: total,
      date: (await order).createdAt, // Order date
      orderId: (await order)._id, // Reference to the order
    }).save();
    res.status(200).send({
      success: true,
      message: "Cash On Delivery Order Successful",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in COD order",
      error,
    });
  }
};

//Online Payment Order
export const onlinePaymentController = async (req, res) => {
  try {
    const { cart, onlinePaymentOption, lastNumber } = req.body;
    let total = 0;
    cart.map((item) => {
      total = total + item.price * item.amount;
    });

    const order = new orderModel({
      products: cart,
      payment: onlinePaymentOption,
      lastNumber,
      buyer: req.user._id,
    }).save();

    // Update product quantities
    for (const item of cart) {
      await productModel.findByIdAndUpdate(
        item._id,
        { $inc: { quantity: -item.amount } }, // Reduce quantity by the purchased amount
        { new: true }
      );
    }

    // Update product quantities in inventory model
    for (const item of cart) {
      await inventoryModel.findByIdAndUpdate(
        item.inventory,
        { $inc: { currentQty: -item.amount } }, // Reduce quantity by the purchased amount
        { new: true }
      );
    }

    const buyerId = req.user._id;
    const orderId = (await order)._id;
    const user = await userModel.findById(buyerId);
    const name = user.name;
    const email = user.email;
    await sendOrderCorfirmationToEmail(email, name, orderId);

    // Create a new transaction entry
    const transaction = await new transactionModel({
      debitAccounts: [new mongoose.Types.ObjectId("67b181b7e22f8c747e10030b")], // Bank
      creditAccounts: [new mongoose.Types.ObjectId("67b1867baf3a92b604657119")], // Sales
      amount: total,
      date: (await order).createdAt, // Order date
      orderId: (await order)._id, // Reference to the order
    });
    res.status(200).send({
      success: true,
      message: "Cash On Delivery Order Successful",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in COD order",
      error,
    });
  }
};

//most sold products
export const mostSoldProductsController = async (req, res) => {
  try {
    // Step 1: Aggregate orders to calculate total quantity sold for each product
    const topProducts = await orderModel.aggregate([
      { $unwind: "$products" }, // Decompose the products array
      {
        $group: {
          _id: "$products._id", // Group by product _id
          totalQuantity: { $sum: "$products.amount" }, // Sum up the quantity
        },
      },
      { $sort: { totalQuantity: -1 } }, // Sort by totalQuantity in descending order
      { $limit: 5 }, // Limit to top 5 products
    ]);

    // Step 2: Extract product IDs
    const productIds = topProducts.map((product) => product._id);

    // Step 3: Fetch product details along with reviews
    const products = await productModel
      .find({ _id: { $in: productIds } })
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });

    // Step 4: Map products with their totalQuantity and sort them
    const topSoldProducts = products
      .map((product) => {
        const quantityInfo = topProducts.find(
          (item) => item._id.toString() === product._id.toString()
        );
        return {
          ...product.toObject(),
          totalQuantity: quantityInfo?.totalQuantity || 0, // Add totalQuantity property
        };
      })
      .sort((a, b) => b.totalQuantity - a.totalQuantity); // Sort by totalQuantity in descending order

    res.status(200).send({
      success: true,
      topSoldProducts,
    });
  } catch (error) {
    console.error("Error fetching top sold products:", error);
    res.status(500).json({ error: "Failed to fetch top sold products" });
  }
};

//DISCOUNTED PRODUCTS
export const getProductsWithOriginalPrice = async (req, res) => {
  try {
    // Find products where originalPrice exists and is not empty
    const products = await productModel
      .find({ originalPrice: { $ne: "" } })
      .populate({
        path: "reviews", // Populate the reviews field
        model: "Review", // Specify the Review model
        select: "stars reviewText user", // Select specific fields from the Review model
        populate: {
          path: "user", // Optionally populate user details
          model: "users",
          select: "name email", // Select fields from User model
        },
      });

    res.status(200).send({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
