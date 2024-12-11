const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("User Role:", req.userRole);
    console.log("Allowed Roles:", roles);
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = { authorizeRoles };
