const multer = require("multer");
const AppError = require("../AppError");
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadFiles = upload.array("images", 2);
const uploadProductsImages = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        // Too many images exceeding the allowed limit

        return next(
          new AppError("Too many images exceeding the allowed limit", 400)
        );
      }
    } else if (err) {
      return next(new AppError(err.message, 400));
    }

    // Everything is ok.
    next();
  });
};
module.exports = uploadProductsImages;
