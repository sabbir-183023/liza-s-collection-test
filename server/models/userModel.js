import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'Bangladesh',
    },
    answer: {
      type: {},
      default: '',
    },
    role: {
      type: Number,
      default: 0,
    },
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);
