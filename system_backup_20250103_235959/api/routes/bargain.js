const express = require("express");
const router = express.Router();

router.post("/start", (req, res) => {
  res.json({ success: true, message: "Bargain feature coming soon" });
});

module.exports = router;
