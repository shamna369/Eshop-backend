const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
const userRouter = require("./routers/userRoutes.js");
const errorHandler = require("./middlewares/ErrorHandler.js");
const AppError = require("./AppError.js");
const productRouter = require("./routers/productRoutes.js");
const orderRouter = require("./routers/orderRouter.js");
const paymentRouter = require("./routers/paymentRouter.js");
const { handleWebhook } = require("./controllers/paymentController.js");
const { createOrder } = require("./controllers/orderController.js");

//MIDDLEWARES
app.use(
  cors({ credentials: true, origin: "https://eshop-store-q1kv.onrender.com" })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  "/productImageUploads",
  express.static(path.join(__dirname, "public/productImageUploads"))
);
//ROUTES
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

app.use("/api/user", userRouter);
app.use("/api/products", productRouter);

app.use("/api/payment-session", paymentRouter);
app.use("/api/order", orderRouter);
///////////////////

//ERROR HANDLERS
app.all("*", (req, res, next) => {
  next(new AppError("PAGE NOT FOUND", 401));
});
app.use(errorHandler);
module.exports = app;
