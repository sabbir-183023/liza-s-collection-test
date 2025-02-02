import express from "express";
import {createReview, reviewExistCheck} from "../controllers/reviewController.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";

//router object

const router = express.Router();

//review esistance check
router.get("/:productId/:orderId/:userId", requireSignIn, reviewExistCheck );

//create review
router.post('/review', requireSignIn, createReview)

export default router;
