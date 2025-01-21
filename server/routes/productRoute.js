import express from "express";
import {
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  editProductController,
  productCountController,
  productListController,
  productFilterCOntroller,
  searchProductController,
  relatedProductController,
  productCategoryController,
  braintreeTokenController,
  braintreePaymentController,
  getSingleProductControllerById,
  codController,
  mostSoldProductsController,
} from "../controllers/productController.js";
import multer from "multer";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer setup for file handling

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

//routes
//create product
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  upload.single("photo"),
  createProductController
);

//edit product
router.put(
  "/edit-product/:id",
  requireSignIn,
  isAdmin,
  upload.single("photo"),
  editProductController
);

//get products
router.get("/get-product", getProductController);

//single product by slug
router.get("/get-product/:slug", getSingleProductController);

//single product by id
router.get("/get-one-product/:pid", getSingleProductControllerById);

//delete rproduct
router.delete("/delete_product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFilterCOntroller);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", relatedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
router.get("/braintree/token", braintreeTokenController);

//payment
router.post("/braintree/payment", requireSignIn, braintreePaymentController);

//COD Order
router.post("/cod", requireSignIn, codController);

//Most Sold Products
router.get("/most-sold-products", mostSoldProductsController);

export default router;
