const multer = require("multer");
// const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const AppError = require("../AppError");

///////////////////
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/users/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      "user-" + Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log(file);
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

exports.uploadUserPhoto = upload.single("photo");
