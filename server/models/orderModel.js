import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [],
    payment: {},
    lastNumber:{
      type: String,
      default: "",
    },
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Pending Confirmation",
      enum: [
        "Pending Confirmation",
        "Processing",
        "Ready to Ship",
        "In Transit",
        "Delivered",
        "Cancelled",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
