import inventoryModel from "../models/inventoryModel.js";
import TransactionModel from "../models/transactionModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";

export const createInventory = async (req, res) => {
  try {
    const {
      date,
      productName,
      supplier,
      barcode,
      initialQty,
      currentQty,
      purchaseRate,
      CPP,
      CFP,
      saleRate,
      profitPerProduct,
    } = req.body;

    // Validate required fields
    if (
      !date ||
      !productName ||
      !initialQty ||
      !currentQty ||
      !purchaseRate ||
      !CPP ||
      !CFP ||
      !saleRate ||
      !profitPerProduct
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Create new product
    const newProduct = new inventoryModel({
      date,
      productName,
      supplier,
      barcode,
      initialQty,
      currentQty,
      purchaseRate,
      CPP,
      CFP,
      saleRate,
      profitPerProduct,
    });

    // Save to database
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully.", product: newProduct });
  } catch (error) {
    console.log(error);
    res.staus(500).send({
      success: false,
      message: "Server error in creating new inventry record",
      error,
    });
  }
};

//EDIT INVENTORY
export const editInventory = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from URL params
    const {
      date,
      productName,
      supplier,
      barcode,
      initialQty,
      currentQty,
      purchaseRate,
      CPP,
      CFP,
      saleRate,
      profitPerProduct,
    } = req.body;

    // Find the product by ID
    const product = await inventoryModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Update only the fields that are provided by the user
    if (date) product.date = date;
    if (productName) product.productName = productName;
    if (supplier) product.supplier = supplier;
    if (barcode) product.barcode = barcode;
    if (initialQty) product.initialQty = initialQty;
    if (currentQty) product.currentQty = currentQty;
    if (purchaseRate) product.purchaseRate = purchaseRate;
    if (CPP) product.CPP = CPP;
    if (CFP) product.CFP = CFP;
    if (saleRate) product.saleRate = saleRate;
    if (profitPerProduct) product.profitPerProduct = profitPerProduct;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: "Product updated successfully.", product });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Server error in updating product.",
      error,
    });
  }
};

//delete inventory
export const deleteInventory = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from URL params

    // Find and delete the product by ID
    const deletedProduct = await inventoryModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Server error in deleting product.",
      error,
    });
  }
};

//Get all inventories
export const getAllInventories = async (req, res) => {
  try {
    const inventories = await inventoryModel.find({}).sort({ date: -1 });
    res.status(201).send({
      success: true,
      inventories,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Server error in fetching inventories",
    });
  }
};

//Custom Sale
export const customSale = async (req, res) => {
  try {
    const { remarks, totalPrice, date, productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid inventory ID" });
    }

    // Find the inventory first
    const inventory = await inventoryModel.findById(productId);
    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    // Find the corresponding product using inventory._id
    const product = await productModel.findOne({ inventory: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Define fixed debit and credit accounts
    const debitAccountId = "67b1868aaf3a92b60465711e";
    const creditAccountId = "67b1867baf3a92b604657119";

    // Create a new transaction
    const transaction = new TransactionModel({
      debitAccounts: [debitAccountId],
      creditAccounts: [creditAccountId],
      amount: totalPrice,
      date,
      remarks,
    });

    // Save transaction to the database
    await transaction.save();

    // Reduce quantity in inventory model (Since productId is actually inventory._id)
    const updatedInventory = await inventoryModel.findByIdAndUpdate(
      productId, // Here productId is actually inventory._id
      { $inc: { currentQty: -quantity } }, // Reduce inventory quantity
      { new: true }
    );

    // Reduce quantity in product model
    const updatedProduct = await productModel.findByIdAndUpdate(
      product._id, // Now we use the correct product._id
      { $inc: { quantity: -quantity } }, // Reduce product quantity
      { new: true }
    );

    res.status(201).send({
      success: true,
      message: "Transaction recorded and stock updated successfully",
      transaction,
      updatedProduct,
      updatedInventory,
    });
  } catch (error) {
    console.error("Error in customSale:", error);
    res.status(500).send({
      success: false,
      message: "Server Error",
      error,
    });
  }
};
