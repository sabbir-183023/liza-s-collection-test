import express from "express";
import { getContents, addContent, deleteContent } from "../controllers/homePageSlide.js";

const router = express.Router();

// Route to fetch all contents
router.get("/", getContents);

// Route to add new content
router.post("/", addContent);

// Route to delete content by ID
router.delete("/:id", deleteContent);

export default router;
