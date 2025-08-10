const Contact = require("../models/contactModel.js");
const Subscribe = require("../models/subscribeModel.js");

const createContact = async (req, res) => {
  const { name, email, phone, query } = req.body;
  try {
    const contact = new Contact({ name, email, phone, query });
    await contact.save();
    res.status(201).json({ success: true, message: "Contact aangemaakt!" }); // Contact created successfully!
  } catch (error) {
    console.error("Fout bij het maken van contact:", error.message); // Error creating contact:
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
        .json({ success: false, message: "E-mail is al geabonneerd!" }); // Email already subscribed!
    }
    const subscribe = new Subscribe({ email });
    await subscribe.save();
    res.status(201).json({ success: true, message: "Abonnement succesvol!" }); // Subscription successful!
  } catch (error) {
    console.error("Fout bij aanmaken abonnement:", error.message); // Error creating subscription:
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createContact,
  createSubscribe,
};
