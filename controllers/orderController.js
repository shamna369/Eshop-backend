//after order success send payment details to customer
const asyncHandler = require("express-async-handler");
const AppError = require("../AppError.js");
const Order = require("../models/orderModel.js");
const User = require("../models/userModel.js");
const { default: mongoose } = require("mongoose");
//create order
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Validate required fields
  const userId = req.body.userId;

  //const userId = "677c0f9f1b7d41e214f5cc51";
  const userValid = await User.findById(userId);
  if (!userValid) return next(new AppError("user id is invalid", 401));
  // console.log(req.body);
  const { cart, shippingAddress } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return next(new AppError("Cart must be a non-empty array", 400));
  }
  if (!shippingAddress || !userId) {
    return next(new AppError("Shipping address and user ID are required", 400));
  }

  // Calculate totalPrice from cart
  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity) * Number(item.discountPrice || 0),
    0
  );

  // Create the order
  const newOrder = await Order.create({
    cart,
    shippingAddress,
    userId,
    totalPrice,
  });

  // Respond with success
  res.status(201).json({
    message: "New order created successfully",
    newOrder,
  });
});
//get all orders of a user
exports.getAllOrdersOfUser = asyncHandler(async (req, res, next) => {
  const userId = req.currentUser._id;
  console.log(req.currentUser);
  const userValid = await User.findById(userId);
  if (!userValid) return next(new AppError("user id is invalid", 401));
  const orders = await Order.find({ userId: userId });
  if (Array.isArray(orders) && !orders.length)
    return next(new AppError("no orders for this id", 404));
  res.status(200).json({
    status: "successfull",
    orders,
  });
});
//get all orders for admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });

  if (Array.isArray(orders) && !orders.length)
    return next(new AppError("no orders ", 404));
  res.status(200).json({
    status: "all orders are fetched succesfully",
    orders,
  });
});
//update delivery status
exports.updateDeliveryStatus = asyncHandler(async (req, res, next) => {
  const orderid = req.body.id;

  const order = await Order.findById(orderid);

  if (!order) {
    return next(
      new AppError("No order found with this ID, please check.", 404)
    );
  }

  // Check payment status before updating
  if (order.paymentInfo.status !== "Paid by card") {
    order.paymentInfo.status = "Paid";
  }

  order.deliveredAt = { deliveryDate: Date.now(), status: "Delivered" };
  order.paidAt = Date.now();
  order.status = "Delivered";

  // Save the updated order
  const updatedOrder = await order.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "Delivery status updated successfully",
    order: updatedOrder,
  });
});

//get order by order id
exports.getOrderById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findById(id);
  if (!order) return next(new AppError("no orders in this id ", 404));
  res.status(200).json({
    status: "order is fetched succesfully",
    order,
  });
});
//total order paid amount
exports.TotalSale = asyncHandler(async (req, res, next) => {
  const salesAggregate = await Order.aggregate([
    { $match: { "paymentInfo.status": "Paid" } }, // Match paid orders
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" }, // Sum totalPrice of matched orders
      },
    },
  ]);

  res.status(200).json({
    success: true,
    totalSales: salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0,
  });
});
//get total order count
exports.getOrdersTotalCount = asyncHandler(async (req, res, next) => {
  const totalOrders = await Order.countDocuments(); // Get total count
  res.status(200).json({ status: "success", total: totalOrders });
});
//paid order vs in date
exports.getPaidOrderWithDates = asyncHandler(async (req, res, next) => {
  const paidOrders = await Order.aggregate([
    // Group by date and count orders
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Format date
        totalPaidOrders: { $sum: 1 }, // Count orders
      },
    },

    // Project final fields
    {
      $project: {
        _id: 0, // Hide MongoDB default _id
        date: "$_id", // Rename _id to date
        totalPaidOrders: 1, // Keep count field
      },
    },

    // Sort by date (newest first)
    { $sort: { date: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    paidOrders,
  });
});
