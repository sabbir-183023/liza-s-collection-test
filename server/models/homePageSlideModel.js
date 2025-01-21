import mongoose from "mongoose";

const SlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const HomePageSlide = mongoose.model("HomePageSlide", SlideSchema);

export default HomePageSlide;