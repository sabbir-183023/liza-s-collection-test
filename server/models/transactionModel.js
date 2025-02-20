import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    debitAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true,
      },
    ],
    creditAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true,
      },
    ],
    amount: {
      type: Number,
      required: true,
      min: 0.01, // Ensure amount is positive
    },
    date: {
      type: Date,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const TransactionModel = mongoose.model("Transactions", transactionSchema);

export default TransactionModel;
