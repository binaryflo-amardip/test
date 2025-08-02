const express = require("express");
const {
  createContact,
  createSubscribe,
} = require("../controllers/contactController");

const router = express.Router();

router.post("/contact", createContact);
router.post("/subscribe", createSubscribe);

module.exports = router;
