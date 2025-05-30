const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment=require('../../db/models/Payment')
require('dotenv').config();

// Check if environment variables are loaded
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Razorpay credentials not found in environment variables");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in rupees

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount provided" });
    }

    // Log the amount being processed
    console.log("Creating order for amount:", amount);

    const options = {
      amount: Math.round(amount * 100), // Amount in paise, ensure it's an integer
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // Log the options being sent to Razorpay
    console.log("Razorpay options:", options);

    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating order:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      message: "Error creating Razorpay order", 
      error: error.message,
      details: error.response?.data || "No additional details available"
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = sign === razorpay_signature;
    const paymentStatus = isSignatureValid ? "Paid" : "Failed";

    const newPayment = new Payment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: amount,
      createdAt: new Date(),
      status: paymentStatus
    });

    await newPayment.save();

    if (isSignatureValid) {
      res.status(200).json({ message: "Payment verified" });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
