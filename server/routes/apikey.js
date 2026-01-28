const express = require("express");
const router = express.Router();
const ApiKey = require("../models/ApiKey");
const CryptoJS = require("crypto-js");
const { authMiddleware } = require("../middleware/auth");

// Encryption secret (from environment)
const ENCRYPTION_SECRET =
  process.env.ENCRYPTION_SECRET || "student-tracker-secret-key-2026";

// Encrypt API key before saving
const encryptKey = (key) => {
  return CryptoJS.AES.encrypt(key, ENCRYPTION_SECRET).toString();
};

// Decrypt API key for use
const decryptKey = (encryptedKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// All routes require authentication
router.use(authMiddleware);

// GET API key (decrypted) for current user
router.get("/", async (req, res) => {
  try {
    const apiKey = await ApiKey.findOne({
      service: "gemini",
      userId: req.userId,
    });
    if (apiKey && apiKey.key) {
      const decryptedKey = decryptKey(apiKey.key);
      res.json({ key: decryptedKey });
    } else {
      res.json({ key: "" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SAVE API key (encrypted) for current user
router.post("/", async (req, res) => {
  try {
    const encryptedKey = encryptKey(req.body.key);

    let apiKey = await ApiKey.findOne({
      service: "gemini",
      userId: req.userId,
    });

    if (apiKey) {
      apiKey.key = encryptedKey;
      await apiKey.save();
    } else {
      apiKey = new ApiKey({
        key: encryptedKey,
        service: "gemini",
        userId: req.userId,
      });
      await apiKey.save();
    }
    res.json({ message: "API key saved successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
