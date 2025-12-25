const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
const File = require("../Models/FileModel");

// ==========================
// HELPER
// ==========================
async function uploadToCloudinary(
  file,
  folder,
  resourceType = "auto",
  options = {}
) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: resourceType,
    ...options,
  });
}

function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

// ==========================
// LOCAL FILE UPLOAD
// ==========================
exports.localFileUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.files.file;
    const uploadDir = path.join(__dirname, "../Files");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadPath = path.join(uploadDir, fileName);

    file.mv(uploadPath, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Local upload failed",
        });
      }

      return res.status(200).json({
        success: true,
        message: "File uploaded locally",
        path: `/Files/${fileName}`,
      });
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ==========================
// IMAGE UPLOAD (NO QUALITY)
// ==========================
exports.ImageUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const file = req.files.imageFile;
    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = file.name.split(".").pop().toLowerCase();

    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported",
      });
    }

    const response = await uploadToCloudinary(
      file,
      "Images",
      "image"
    );

    const { name, tags, email } = req.body;

    await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded",
      imageUrl: response.secure_url,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

// ==========================
// IMAGE REDUCER (QUALITY ONLY HERE)
// ==========================
exports.imageReducerUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const file = req.files.imageFile;
    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = file.name.split(".").pop().toLowerCase();

    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported",
      });
    }

    const response = await uploadToCloudinary(
      file,
      "CompressedImages",
      "image",
      { quality: 60 } // 🔥 ONLY THIS ROUTE USES QUALITY
    );

    const { name, tags, email } = req.body;

    await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Image compressed & uploaded",
      imageUrl: response.secure_url,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Compressed image upload failed",
    });
  }
};

// ==========================
// VIDEO UPLOAD
// ==========================
exports.videoUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.videoFile) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    const file = req.files.videoFile;
    const MAX_SIZE = 15 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Video size exceeds 15MB",
      });
    }

    const supportedTypes = ["mp4", "mov"];
    const fileType = file.name.split(".").pop().toLowerCase();

    if (!supportedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Video format not supported",
      });
    }

    const response = await uploadToCloudinary(
      file,
      "Videos",
      "video"
    );

    const { name, tags, email } = req.body;

    const fileData = await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Video uploaded",
      data: fileData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Video upload failed",
    });
  }
};
