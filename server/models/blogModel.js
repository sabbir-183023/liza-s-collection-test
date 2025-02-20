import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
      },
    content: {
      type: String,
      required: true,
    },
    photo: {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    comments: [commentSchema], // Embedding comments inside the blog model
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
