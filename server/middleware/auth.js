const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "student-task-tracker-secret-key-2024";

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No token provided. Please login." });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user ID to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please login again." });
    }
    return res.status(401).json({ error: "Invalid token. Please login." });
  }
};

module.exports = { authMiddleware, JWT_SECRET };
