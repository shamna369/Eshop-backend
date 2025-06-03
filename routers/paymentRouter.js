const express = require("express");
const router = express.Router();
const {
  paymentProcess,
  handleWebhook,
} = require("../controllers/paymentController");

router.post("/create-checkout-session", paymentProcess);

module.exports = router;
