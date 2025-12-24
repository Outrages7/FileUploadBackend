const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// File upload middleware (ONLY ONCE)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Database connection
const db = require("./Config/Database");
db();

// Cloudinary connection
const cloudinary = require("./Config/Cloudinary");
cloudinary.cloudinaryConnect();

// Serve static files
app.use("/Files", express.static(path.join(__dirname, "Files")));

// Routes
const Upload = require("./Route/FileUploadRoute");
app.use("/api/v1/upload", Upload);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
