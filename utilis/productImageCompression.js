const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");

const resizeUploadImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  // Ensure the uploads directory exists
  const uploadsDir = path.resolve(__dirname, "../public/productImageUploads");
  //const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  req.body.images = [];

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(uploadsDir, filename);

        // Resize and save the image
        await sharp(file.buffer)
          .resize(640, 320)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(filepath);

        req.body.images.push(filename);
      })
    );
    next();
  } catch (err) {
    console.error("Error processing images:", err);
    next(err); // Pass the error to the next middleware
  }
});

module.exports = resizeUploadImages;
