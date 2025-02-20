import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createAccountController,
  getAllAccountsController,
  addTransactionController,
  getALlTransactions,
  getAccountTransactionController,
} from "../controllers/accountingController.js";

const router = express.Router();

//Routes

//get All Account
router.get("/", requireSignIn, isAdmin, getAllAccountsController);

//Create Account
router.post("/create-account", requireSignIn, isAdmin, createAccountController);

//Delete Account
router.delete("/delete-category/:id", requireSignIn, isAdmin);

//Add a transaction
router.post("/transactions", requireSignIn, isAdmin, addTransactionController);

//Get all transactions
router.get("/transactions/:page", requireSignIn, isAdmin, getALlTransactions);

//Account wise transaction get
router.get(
  "/ledger/:accId/:startYear/:startMonth/:endYear/:endMonth",
  requireSignIn,
  isAdmin,
  getAccountTransactionController
);

export default router;
