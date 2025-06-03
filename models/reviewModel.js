const mongoose = require("mongoose");
const Product = require("./productModel.js");
const User = require("./userModel.js");
const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      default: 2,
      min: 1,
      max: 5,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: ["true", "must be valid User Id"],
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: ["true", "must be valid Product Id"],
    },
    comment: {
      type: String,
      default: "Good",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Review = mongoose.model("Review", ReviewSchema);
export default Review;
