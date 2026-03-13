const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "token_ausente_ou_invalido" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "token_invalido" });
  }
}

module.exports = { authMiddleware };
