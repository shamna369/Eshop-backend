const express = require("express");
const router = express.Router();
const uploadProductsImages = require("../utilis/productImagesUpload.js");
const resizeUploadImages = require("../utilis/productImageCompression.js");
const {
  getProductsByCategory,
  getProductById,
  getAllProducts,
  createProduct,
  updateProductDetailsById,
  deleteProductById,
  writeReview,
  deleteReviewPostedById,
  getCategoriesName,
  getProductsTotalCount,
  getCategoriesCount,
} = require("../controllers/productController.js");
router.get("/all-products", getAllProducts);
router.post(
  "/create-product",
  uploadProductsImages,
  resizeUploadImages,
  createProduct
);
router.get("/getallcategory", getCategoriesName);
router.get("/details/:id", getProductById);
router.get("/category/:category", getProductsByCategory);
router.get("/total-products", getProductsTotalCount);
router.get("/total-category-count", getCategoriesCount);
//review
router.post("/create-new-review/:productId/:userId", writeReview);
//ONLY ADMIN ROUTE
router.route("/:id").patch(updateProductDetailsById).delete(deleteProductById);
router.delete("/:productId/delete-review/:reviewId", deleteReviewPostedById);

module.exports = router;
