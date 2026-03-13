require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  storeCep: process.env.STORE_CEP || "30140071"
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL ausente");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET ausente");
}

module.exports = { env };
