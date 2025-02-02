import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: ''
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photos: [
      {
        url: { type: String }, // Cloudinary URL
        public_id: { type: String }, // Cloudinary public ID
      },
    ], // Array of photos
    colors: []
  },
  { timestamps: true }
);

// Add a virtual field for reviews
productSchema.virtual("reviews", {
  ref: "Review", // The Review model
  localField: "_id", // The Product's _id field
  foreignField: "product", // The product field in the Review model
});

// Enable virtual fields to be included in JSON and Object outputs
productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
