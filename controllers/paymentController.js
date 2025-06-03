const asyncHandler = require("express-async-handler");
const AppError = require("../AppError");
const Order = require("../models/orderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.paymentProcess = async (req, res) => {
  const { totalPrice, orderId, userId, email, name } = req.body;

  try {
    const customerCreated = await stripe.customers.create({
      name,
      email,
      metadata: {
        orderId: orderId,
        userId: userId,
      },
    });
    // console.log(customerCreated.id);

    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerCreated.id,
      metadata: {
        orderId: orderId,
        userId: userId,
      },

      amount: Math.round(totalPrice * 100),
      currency: "usd",
      setup_future_usage: "off_session",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res
      .status(200)
      .json({ client_secret: paymentIntent.client_secret, customerCreated });
  } catch (err) {
    throw new Error(err);
  }
};
//payment success message and order success by webhook

exports.handleWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

  const signature = req.headers["stripe-signature"];
  let event = req.body;

  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  if (event.type === "payment_intent.succeeded") {
    console.log("payment success");

    const paymentIntent = event.data.object;
    const customerId = paymentIntent.customer;
    //console.log(customerId);

    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId);

        // Store order details in your database here

        if (customer.metadata.orderId) {
          const order_id = customer.metadata.orderId;
          const order = await Order.findByIdAndUpdate(
            { _id: order_id },
            { paymentInfo: { status: "Paid by card" } },
            { new: true, runValidators: false }
          );
        }
      } catch (err) {
        console.error("Error fetching customer details:", err);
      }
    } else {
      console.log("No customer associated with this payment intent.");
    }
  }

  res.status(200).json({ received: true });
};
