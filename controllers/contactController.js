const Contact = require("../models/contactModel.js");
const Subscribe = require("../models/subscribeModel.js");

const createContact = async (req, res) => {
  const { name, email, phone, query } = req.body;
  try {
    const contact = new Contact({ name, email, phone, query });
    await contact.save();
    res
      .status(201)
      .json({ success: true, message: "Contact created successfully" });
  } catch (error) {
    console.error("Error creating contact:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSubscribe = async (req, res) => {
  const { email } = req.body;
  try {
    const existingSubscription = await Subscribe.findOne({ email });
    if (existingSubscription) {
      return res
        .status(400)
        .json({ success: false, message: "Email already subscribed" });
    }
    const subscribe = new Subscribe({ email });
    await subscribe.save();
    res.status(201).json({ success: true, message: "Subscription successful" });
  } catch (error) {
    console.error("Error creating subscription:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createContact,
  createSubscribe,
};
