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

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.body;
    //Validation
    switch (true) {
      case !name:
        return res.status(501).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case !req.file.path:
        return res.status(501).send({ error: "Photo is Required" });
    }

    // Upload photo to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ProductPhotos",
    });
    console.log(result);
    fs.unlink(req.file.path, (err) => {
      if (err)
        res.status(500).send({
          success: false,
          message: "Error in Deleting Photo From Local Library!",
        });
    });
    const products = new productModel({
      name,
      slug: slugify(name),
      description,
      price,
      category,
      quantity,
      photo: result.secure_url,
      photo_public_id: result.public_id,
      shipping,
    });
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in crearing product",
    });
  }
};

// get single product by id
export const getSingleProductControllerById = async (req, res) => {
  try {
    const product = await productModel.findById({ _id: req.params.pid });
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
    const { name, description, price, category, quantity } = req.body;
    const product = await productModel.findById(id);
    let photo = req.file ? req.file : null;

    console.log(id);

    // Find the product by ID
    await productModel.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name),
        description,
        price,
        category,
        quantity,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
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

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
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
      .populate("category");
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

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    const _id = req.params.pid;
    console.log(_id);
    const product = await productModel.findOne({ _id });
    console.log(product);
    if (!product) {
      res.status(401).send({
        success: false,
        message: "Couldn't find any product",
      });
    }
    const photoDelete = await cloudinary.uploader.destroy(
      product.photo_public_id
    );
    if (!photoDelete) {
      res.status(402).send({
        success: false,
        message: "Error in deleting photo from cloudinary!",
      });
    }
    await productModel.findByIdAndDelete(req.params.pid);
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate products
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //alidation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte product",
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
    const products = await productModel.find(args);
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
    const result = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
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
      .populate("category");
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
    const products = await productModel.find({ category }).populate("category");
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
      total = total + item.price * item.amount;
    });

    const order = new orderModel({
      products: cart,
      payment: "cod",
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

    const buyerId = req.user._id;
    const user = await userModel.findById(buyerId);
    const name = user.name;
    const email = user.email;
    await sendOrderCorfirmationToEmail(email, name);
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
