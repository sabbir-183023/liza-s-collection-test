import express from "express";
import {
  getContents,
  addContent,
  deleteContent,
} from "../controllers/homePageSlide.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to fetch all contents
router.get("/", getContents);

// Route to add new content
router.post("/", requireSignIn, isAdmin, addContent);

// Route to delete content by ID
router.delete("/:id", requireSignIn, isAdmin, deleteContent);

export default router;
