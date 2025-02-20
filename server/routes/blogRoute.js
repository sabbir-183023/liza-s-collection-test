import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createBlogController,
  getNewsletterEmailController,
  getSingleBLogController,
  editBlogController,
  deleteBlogController,
  getBlogsController,
  deleteNewsLetterEmailController,
  getSingleBLogByIdController,
  getFourBlogsController,
  addComment,
  toggleLike,
} from "../controllers/blogController.js";
import multer from "multer";

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

//Routes
//add emails for newsletter
router.post("/newsletter-email", getNewsletterEmailController);

//create a blog
router.post(
  "/create-blog",
  requireSignIn,
  isAdmin,
  upload.single("photo"),
  createBlogController
);

//remove email from news letter
router.post("/delete-email", deleteNewsLetterEmailController);

//Get blogs
router.get("/get-blogs", getBlogsController);

//Get blogs
router.get("/get-four-blogs", getFourBlogsController);

//GET SINGLE BLOG
router.get("/get-blog/:slug", getSingleBLogController);

//GET SINGLE BLOG BY ID FOR UPDATE
router.get("/get-single-blog/:id", getSingleBLogByIdController);

// Edit a blog with photo upload
router.put(
  "/edit-blog/:id",
  upload.single("photo"),
  requireSignIn,
  isAdmin,
  editBlogController
);

//delete a blog
router.delete("/delete/:id", requireSignIn, isAdmin, deleteBlogController);

//add comment route
router.post("/add-comment/:blogId", requireSignIn, addComment);

//like to blog
router.post("/toggle-like/:blogId", requireSignIn, toggleLike);

export default router;
