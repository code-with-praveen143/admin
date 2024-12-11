const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const message = err.name === "TokenExpiredError"
          ? "Token expired"
          : "Failed to authenticate token";
        return res.status(403).json({ message });
      }

      // Set the entire user object in req.user
      req.user = {
        id: decoded.id,
        role: decoded.role,
        isSuperAdmin: decoded.role === "SuperAdmin" ? true : false,
        isAdmin: decoded.role === "Admin"? true : false,
        isStudent: decoded.role === "Student"? true : false  
      }

      // Fix: Use req.user.id instead of req.id in the console.log
      console.log("Middleware - User details:", {
        id: req.user.id,    
        role: req.user.role,
        isSuperAdmin: req.user.isSuperAdmin  // Add isSuperAdmin to the user object in req.user
      });

      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

module.exports = { authMiddleware };