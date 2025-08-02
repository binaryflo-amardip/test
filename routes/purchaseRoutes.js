const express = require("express");
const {
  createPaymentIntent,
  getLatestPurchase,
} = require("../controllers/purchaseController");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

router.post("/create-payment-intent", userAuth, createPaymentIntent);
router.get("/latest-purchase", userAuth, getLatestPurchase);

module.exports = router;
