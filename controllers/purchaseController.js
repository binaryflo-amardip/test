const Purchase = require("../models/purchaseModel.js");
const User = require("../models/userModel.js");
const Course = require("../models/courseModel.js");
const Lession = require("../models/lessionModel.js");
const Video = require("../models/videoModel.js");
const Stripe = require("stripe");
const { mailerHtml } = require("../utils/mailer.js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const createPaymentIntent = async (req, res) => {
  console.log("▶️ [POST] /api/create-payment-intent");

  try {
    const { amount, currency, metadata } = req.body;

    if (!amount || !currency) {
      return res
        .status(400)
        .json({ error: "Amount and currency are required" });
    }

    if (!Number.isInteger(amount) || amount < 50) {
      return res
        .status(400)
        .json({ error: "Invalid amount (min €0.50 required)" });
    }

    const { courseId, packageId, email, userId } = metadata || {};
    if (!courseId || !packageId || !email || !userId) {
      return res.status(400).json({
        error: "Missing metadata: courseId, packageId, email, or userId",
      });
    }

    console.log(userId, courseId, packageId, email);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId: String(userId),
        courseId: String(courseId),
        packageId: String(packageId),
        email: String(email),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Course ${courseId} - Package ${packageId}`,
    });

    console.log("✅ Created PaymentIntent:", paymentIntent.id);

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    return res.status(500).json({ error: "Payment intent creation failed" });
  }
};

const getLatestPurchase = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const purchase = await Purchase.findOne({
      userId,
    })
      .sort({ createdAt: -1 })
      .lean();
    const course = await Course.findById(purchase.courseId).lean();
    return res.status(200).json({
      success: true,
      message: "Latest purchase fetched successfully",
      purchase,
      course,
    });
  } catch (err) {
    console.error("❌ Error fetching latest purchase:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = req.body;

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Invalid webhook signature:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  console.log("📦 Stripe event:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata || {};

    try {
      const { email, userId, courseId, packageId } = metadata;

      if (!email || !userId || !courseId || !packageId) {
        return res.status(400).json({ error: "Missing metadata fields" });
      }

      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ error: "User not found" });

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const lesson = await Lession.findOne({ courseId: courseId, order: 1 });
      const video = await Video.findOne({
        lessionId: lesson._id.toString(),
        order: 1,
      });

      const selectedPackage = course.pricing.find((p) => p.id == packageId);
      if (!selectedPackage) {
        return res.status(400).json({ error: "Invalid package ID" });
      }

      const durationDays = parseInt(
        selectedPackage.duration.replace(/[^0-9]/g, ""),
        10
      );
      const now = new Date();

      const purchase = await Purchase.findOne({
        userId: userId,
        courseId: courseId,
      });

      console.log("Current purchase:", purchase);

      if (purchase) {
        console.log("🔄 Updating existing purchase:", purchase._id);
        const currentExpire = purchase.expireAt?.getTime() || 0;
        const base =
          currentExpire > now.getTime() ? currentExpire : now.getTime();
        const newExpireAt = new Date(base + durationDays * 86400000);
        await Purchase.findByIdAndUpdate(purchase._id.toString(), {
          expireAt: newExpireAt,
          timeLimit: newExpireAt.getTime(),
          packageId,
        });

        console.log(
          "🔄 Updated existing purchase with new expiry:",
          newExpireAt
        );
      } else {
        const expireAt = new Date(now.getTime() + durationDays * 86400000);

        const newpurchase = new Purchase({
          userId,
          courseId,
          packageId: packageId,
          watchList: [],
          currentvideo: video._id,
          createdAt: now,
          expireAt,
          timeLimit: expireAt.getTime(),
        });

        await newpurchase.save();
        console.log("✅ New purchase saved:", newpurchase._id);
      }

      // Send confirmation email
      await mailerHtml(
        email,
        "Bedankt voor je aankoop bij cbrcursussen.nl!",
        `
          <body>
            <p><strong>Bedankt voor je aankoop bij cbrcursussen.nl!</strong></p>
            <p>Beste Student,</p>
            <p>Gefeliciteerd! Je aankoop van de cursus is succesvol afgerond.</p>
            <p>Je hebt nu toegang tot alle leerinhoud, interactieve quizzes en oefenexamens die je zullen helpen om je voor te bereiden op het CBR-examen.</p>
            <p><strong>Wat Nu?</strong></p>
            <ul>
              <li>Log in op je account en ga naar je dashboard.</li>
              <li>Start met je cursus en volg je voortgang.</li>
              <li>Maak gebruik van de oefenexamens om jezelf klaar te stomen voor het echte examen.</li>
            </ul>
            <p>Veel succes met je cursus en theorie-examen!</p>
            <p>Met vriendelijke groet, Het cbrcursussen.nl Team</p>
          </body>
        `
      );
    } catch (err) {
      console.error("❌ Error handling payment webhook:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  } else {
    console.log("ℹ️ Ignored event type:", event.type);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  getLatestPurchase,
  handleStripeWebhook,
};
