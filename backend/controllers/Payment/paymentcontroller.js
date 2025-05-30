const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment=require('../../db/models/Payment')
require('dotenv').config();

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

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
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

    const newPayment = new Payment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: amount,
      createdAt: new Date(),
      status: sign === razorpay_signature ? "Paid" : "Failed"
    });

    await newPayment.save();

    if (sign === razorpay_signature) {
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
