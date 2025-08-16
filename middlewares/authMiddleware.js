const Jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).send({ error: "Token is not valid" });
  }
};
