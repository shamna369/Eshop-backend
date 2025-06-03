const mongoose = require("mongoose");
const User = require("./userModel.js");
const orderSchema = new mongoose.Schema(
  {
    cart: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Refund", "Success", "Cancelled"],
    },
    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
        default: "Cash on delivery",
      },
      type: {
        type: String,
      },
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      deliveryDate: {
        type: Date,
      },
      status: {
        type: String,
        default: "on the way",
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
