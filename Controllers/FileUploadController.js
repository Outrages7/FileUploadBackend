const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
const File = require("../Models/FileModel"); 
const { Agent } = require("http");
// ==========================
// LOCAL FILE UPLOAD
// ==========================
exports.localFileUpload = async (req, res) => {
  try {
    // 1️⃣ Check file existence
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.files.file;

    // 2️⃣ Ensure Files directory exists
    const uploadDir = path.join(__dirname, "../Files");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3️⃣ Create unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const uploadPath = path.join(uploadDir, fileName);

    // 4️⃣ Move file to server
    file.mv(uploadPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "File upload failed",
        });
      }

      // 5️⃣ Success response
      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file: {
          name: file.name,
          size: file.size,
          type: file.mimetype,
          path: `/Files/${fileName}`,
        },
      });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ==========================
// HELPER FUNCTIONS
// ==========================
function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

async function uploadToCloudinary(file, folder) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
  });
}

// ==========================
// IMAGE UPLOAD (CLOUDINARY)
// ==========================
exports.ImageUpload = async (req, res) => {
  try {
    // 1️⃣ Check file existence
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const file = req.files.imageFile;

    // 2️⃣ Validate file type
    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = file.name.split(".").pop().toLowerCase();

    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported",
      });
    }

    // 3️⃣ Upload to Cloudinary
    const response = await uploadToCloudinary(file, "Demo");

    const { name, tags, email } = req.body;
 
    // 5️⃣ Save entry in MongoDB ✅
    const fileData = await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    // 4️⃣ Success response (IMPORTANT: return)
    return res.status(200).json({
      success: true,
      message: "Image successfully uploaded",
      imageUrl: response.secure_url,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

exports.videoUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.videoFile) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    const { name, tags, email } = req.body;
    const file = req.files.videoFile;

    const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
    if (file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Video size exceeds 15 MB limit",
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

    // 🔥 THIS WAS THE BUG
    const response = await uploadToCloudinary(file, "DemoVid", "video");

    const fileData = await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    return res.status(200).json({
      success: true,
      message: "Video uploaded & saved successfully",
      data: fileData,
    });

  } catch (err) {
    console.error("VIDEO UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Video upload failed",
    });
  }
};
