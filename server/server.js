import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import productRoutes from "./routes/productRoute.js";
import homepageSlideRoutes from "./routes/homePageSlideRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import accountingRoute from "./routes/AccountingRoute.js";
import blogRoute from "./routes/blogRoute.js";
import inventoryRoute from "./routes/inventoryRoute.js";
import cors from "cors";
import bodyParser from "body-parser";

// config env
dotenv.config();

//database config
connectDB();

//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.json());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/slide", homepageSlideRoutes);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/accounting", accountingRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/inventory", inventoryRoute);

//rest api
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to Liza's Collection",
  });
});

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgYellow.white);
});
