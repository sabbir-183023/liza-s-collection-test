import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createInventory,
  deleteInventory,
  editInventory,
  getAllInventories,
  customSale,
} from "../controllers/inventoryController.js";

const router = express.Router();

// create new entry
router.post("/create-inventory", requireSignIn, isAdmin, createInventory);

//get all inventory
router.get("/get-inventories", requireSignIn, isAdmin, getAllInventories);

//efdit inventory
router.put("/edit-inventory/:productId", requireSignIn, isAdmin, editInventory);

// delete inventory
router.delete(
  "/delete-inventory/:productId",
  requireSignIn,
  isAdmin,
  deleteInventory
);

//Custom sale
router.post("/custom-sale", requireSignIn, isAdmin, customSale);

export default router;
