import dns from "dns";
import Newsletter from "../models/newsletterModel.js";
import dotenv from "dotenv";
import fs from "fs";
import blogModel from "../models/blogModel.js";
import slugify from "slugify";
import cloudinary from "cloudinary";
import { sendNewsletterToEmail } from "../helpers/emailUtils.js";

dotenv.config();

// Cloudinary configuration

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Function to validate email domain (MX records check)
const validateEmailDomain = async (email) => {
  const domain = email.split("@")[1];

  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) {
        resolve(false); // Invalid domain
      } else {
        resolve(true); // Valid domain
      }
    });
  });
};

// Controller for adding email to the newsletter
export const getNewsletterEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Validate email domain (DNS check)
    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email domain" });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res
        .status(400)
        .json({ success: false, message: "Email already subscribed" });
    }

    // Save new subscriber
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(200).json({
      success: true,
      message: "Subscribed to the newsletter!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to add email",
      error,
    });
  }
};

//Delete email from newsletter
export const deleteNewsLetterEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required to delete",
      });
    }

    // Check if email exists in database
    const existingEmail = await Newsletter.findOne({ email });

    if (!existingEmail) {
      return res.status(404).send({
        success: false,
        message: "Email does not exist in our database",
      });
    }

    // Delete the email
    await Newsletter.findOneAndDelete({ email });

    return res.status(200).send({
      success: true,
      message: "Email unsubscribed successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Unable to delete email from newsletter",
      error,
    });
  }
};

//Create a new blog
export const createBlogController = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validation
    switch (true) {
      case !title:
        return res.status(501).send({
          success: false,
          message: "Blog title is required",
        });
      case !content:
        return res.status(500).send({
          success: false,
          message: "Content is required",
        });
    }

    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Photo is required",
      });
    }

    // Upload the photo to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "BlogPhotos",
    });

    // Delete the file from local storage after upload
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file from local storage:", err);
      }
    });

    // Construct the photo object
    const photo = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };

    //save to the database
    const blog = new blogModel({
      title,
      slug: slugify(title),
      content,
      photo,
    });
    await blog.save();

    //Get Newsletter mails
    const newsletterReceipients = await Newsletter.find();
    const emails = newsletterReceipients?.map((m) => m.email);

    if (emails.length > 0) {
      await sendNewsletterToEmail(emails, blog);
    }

    res.status(200).send({
      success: true,
      message: "New blog posted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in creating blog!",
      error,
    });
  }
};

//GET ALL BLOGS
export const getBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel
      .find({})
      .populate("likes", "name email")
      .populate("comments.userId", "name email")
      .populate("comments.replies.userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      blogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error getting blogs!",
      error,
    });
  }
};

//GET FOUR BLOGS
export const getFourBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel
      .find({})
      .populate("likes", "name email")
      .populate("comments.userId", "name email")
      .populate("comments.replies.userId", "name email")
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).send({
      success: true,
      blogs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error getting blogs!",
      error,
    });
  }
};

//GET SINGLE BLOG
export const getSingleBLogController = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await blogModel.findOne(slug).populate("likes");
    res.status(200).send({
      success: true,
      blog,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Failed to get single blog!",
      error,
    });
  }
};

// GET SINGLE BLOG BY ID
export const getSingleBLogByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog by ID and populate likes (with only name & email for performance)
    const blog = await blogModel.findById(id).populate("likes", "name email");

    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found!",
      });
    }

    res.status(200).send({
      success: true,
      blog,
    });
  } catch (error) {
    console.log("Error fetching blog:", error);
    res.status(500).send({
      success: false,
      message: "Failed to get single blog!",
      error: error.message,
    });
  }
};

//EDIT BLOG
export const editBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Find the blog by ID
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(400).send({
        success: false,
        message: "Blog not found!",
      });
    }

    // Update blog details
    blog.title = title;
    blog.slug = slugify(title);
    blog.content = content;

    // Check if a new file is uploaded
    if (req.file) {
      // Upload new photo to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "BlogPhotos",
      });

      // Delete the old photo from Cloudinary
      if (blog.photo && blog.photo.public_id) {
        await cloudinary.uploader.destroy(blog.photo.public_id);
      }

      // Update blog photo
      blog.photo = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };

      // Delete the file from local storage after upload
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file from local storage:", err);
        }
      });
    }

    await blog.save();

    res.status(200).send({
      success: true,
      message: "Blog Updated Successfully!",
      blog,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in editing blogpost!",
      error,
    });
  }
};

// Delete a blog
export const deleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if blog exists
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found!",
      });
    }

    //Delete blog photo from cloudinary
    await cloudinary.uploader.destroy(blog.photo.public_id);

    // Delete the blog
    await blogModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Blog Deleted Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting blog",
      error: error.message,
    });
  }
};

// Add a comment to a blog post
export const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).send({
        success: false,
        message: "User ID and comment text are required.",
      });
    }

    const blog = await blogModel.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .send({ success: false, message: "Blog post not found." });
    }

    const newComment = {
      userId,
      text,
      likes: [],
      replies: [],
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).send({
      success: true,
      message: "Comment Posted!.",
      comment: newComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle like on a blog post
export const toggleLike = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const blog = await blogModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    const likeIndex = blog.likes.indexOf(userId);

    if (likeIndex === -1) {
      // User hasn't liked it yet, so add like
      blog.likes.push(userId);
    } else {
      // User already liked it, so remove like
      blog.likes.splice(likeIndex, 1);
    }

    await blog.save();
    res
      .status(200)
      .json({ message: "Like status updated.", likes: blog.likes.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
