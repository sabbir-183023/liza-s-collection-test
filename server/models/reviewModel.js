import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", // Reference to the order
        required: true,
      },
      stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      reviewText: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  export default mongoose.model("Review", reviewSchema);