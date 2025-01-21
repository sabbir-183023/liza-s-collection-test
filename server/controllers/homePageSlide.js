import Content from "../models/homePageSlideModel.js";

// Get all contents
export const getContents = async (req, res) => {
  try {
    const contents = await Content.find();
    res.status(200).json(contents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contents", error });
  }
};

// Add new content
export const addContent = async (req, res) => {
  try {
    const { title, subtitle, description, image } = req.body;

    // Ensure there are only 3 contents
    const contentCount = await Content.countDocuments();
    if (contentCount >= 3) {
      return res.status(400).json({ message: "Content limit reached" });
    }

    const newContent = new Content({ title, subtitle, description, image });
    const savedContent = await newContent.save();
    res.status(201).json(savedContent);
  } catch (error) {
    res.status(500).json({ message: "Error adding content", error });
  }
};

// Delete content by ID
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const deletedContent = await Content.findByIdAndDelete(id);

    if (!deletedContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.status(200).json({ message: "Content deleted successfully", deletedContent });
  } catch (error) {
    res.status(500).json({ message: "Error deleting content", error });
  }
};