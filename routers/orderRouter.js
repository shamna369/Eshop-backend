const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrdersOfUser,
  getAllOrders,
  updateDeliveryStatus,
  getOrderById,
  TotalSale,
  getOrdersTotalCount,
  getPaidOrderWithDates,
} = require("../controllers/orderController.js");
const { protect } = require("../controllers/authController.js");

router.post("/create-new-order", createOrder);
router.get("/user", protect, getAllOrdersOfUser);
router.get("/details/:id", getOrderById);
router.get("/all-orders", getAllOrders);
router.patch("/update-delivery-status", updateDeliveryStatus);
router.get("/total-sales", TotalSale);
router.get("/count-order", getOrdersTotalCount);
router.get("/paidorder-date", getPaidOrderWithDates);
module.exports = router;
