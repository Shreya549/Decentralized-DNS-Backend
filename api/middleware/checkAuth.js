const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(400).json({
      message: "Access Denied! No token entered.",
    });

  try {
    const token = req.headers.authorization.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Auth failed!",
    });
  }
};
