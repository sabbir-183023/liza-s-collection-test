import AccountsModel from "../models/accountsModel.js";
import TransactionModel from "../models/transactionModel.js";
import mongoose from "mongoose";

//Create a new Account
export const createAccountController = async (req, res) => {
  try {
    const { name, accountingEquation, defaultAcc } = req.body;

    const newAccount = new AccountsModel({
      name,
      accountingEquation,
      defaultAcc,
    });
    await newAccount.save();

    res.status(200).send({
      success: true,
      message: "New Account Created Successfully!",
      newAccount,
    });
  } catch (errpr) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in creating account",
      error,
    });
  }
};

//Get All Accounts
export const getAllAccountsController = async (req, res) => {
  try {
    const accounts = await AccountsModel.find({}).sort({ name: 1 });
    res.status(200).send({ success: true, accounts });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in creating account",
      error,
    });
  }
};

//Add a transaction
export const addTransactionController = async (req, res) => {
  try {
    const { debitAccounts, creditAccounts, amount, date, remarks } = req.body;

    // Ensure all accounts exist
    const allAccounts = [...debitAccounts, ...creditAccounts];
    const foundAccounts = await AccountsModel.find({
      _id: { $in: allAccounts },
    });

    if (foundAccounts.length !== allAccounts.length) {
      return res
        .status(400)
        .json({ error: "One or more account IDs are invalid" });
    }

    const newTransaction = new TransactionModel({
      debitAccounts,
      creditAccounts,
      amount,
      date,
      remarks,
    });
    await newTransaction.save();

    res.status(201).send({
      success: true,
      message: "New Transaction Added Successfully!",
      newTransaction,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in adding a transaction",
      error,
    });
  }
};

//get transactions based on page
export const getALlTransactions = async (req, res) => {
  try {
    const perPage = 5;
    const page = req.params.page ? req.params.page : 1;
    const transactions = await TransactionModel.find()
      .populate("debitAccounts")
      .populate("creditAccounts")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      transactions,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in getting transactions",
      error,
    });
  }
};

// Get Account Transactions within a Date Range for ledger
export const getAccountTransactionController = async (req, res) => {
  try {
    const { accId, startYear, startMonth, endYear, endMonth } = req.params;

    // Validate Account ID
    if (!mongoose.Types.ObjectId.isValid(accId)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid Account ID" });
    }

    // Find the Account
    const account = await AccountsModel.findById(accId);
    if (!account) {
      return res
        .status(404)
        .send({ success: false, message: "Account not found" });
    }

    // Convert accId to ObjectId for MongoDB Query
    const accObjectId = new mongoose.Types.ObjectId(accId);

    // Default Range (Current Year & Month)
    let startDate = new Date(
      `${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`
    );
    let endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of current month

    // If user provided range, override defaults
    if (startYear && startMonth && endYear && endMonth) {
      startDate = new Date(`${startYear}-${startMonth}-01`);
      endDate = new Date(`${endYear}-${endMonth}-01`);
      endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of end month
    }

    // Define Query Filter
    const filter = {
      $or: [{ debitAccounts: accObjectId }, { creditAccounts: accObjectId }],
      date: { $gte: startDate, $lte: endDate },
    };

    // Fetch Transactions
    const transactions = await TransactionModel.find(filter)
      .populate("debitAccounts creditAccounts")
      .sort({ date: 1 });

    res.status(200).send({
      success: true,
      account,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching transactions",
      error,
    });
  }
};
