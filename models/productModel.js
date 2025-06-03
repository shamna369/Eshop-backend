const mongoose = require("mongoose");
const User = require("./userModel");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your product name!"],
    },
    description: {
      type: String,
      required: [true, "Please enter your product description!"],
    },
    category: {
      type: String,
      required: [true, "Please enter your product category!"],
    },

    originalPrice: {
      type: Number,
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your product price!"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter your product stock!"],
    },
    images: {
      type: [String],
      default: ["default.jpg"],
    },

    ratings: {
      type: Number,
    },
    shopId: {
      type: String,
      required: true,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: User,
        },
        rating: {
          type: Number,
          default: 3,
          max: [5, "Maximum value is 5, got {VALUE}"],
          min: 1,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    sold_out: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id; // Remove top-level `id`
        delete ret.__v;
        if (ret.images) {
          ret.images.forEach((image) => {
            delete image.id; // Remove `id` from each image
          });
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);
const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
