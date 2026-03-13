const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { pool } = require("../config/db");
const { env } = require("../config/env");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "body_invalido", details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "email_ja_cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: "erro_interno" });
  }
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "body_invalido", details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "credenciais_invalidas" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "credenciais_invalidas" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: "2h" }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: "erro_interno" });
  }
}

module.exports = { register, login };
