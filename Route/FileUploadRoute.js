const express = require("express");
const router = express.Router();

const {
  ImageUpload,
  videoUpload,
  imageReducerUpload,
  localFileUpload
} = require("../Controllers/FileUploadController");

// Local upload
router.post("/image/local", localFileUpload);

// Cloudinary image upload
router.post("/image/cloud", ImageUpload);

// Cloudinary video upload
router.post("/video/cloud", videoUpload);

module.exports = router;
