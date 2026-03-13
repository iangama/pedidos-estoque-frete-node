const { z } = require("zod");
const { pool } = require("../config/db");

const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price_cents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative()
});

async function createProduct(req, res) {
  const parsed = createProductSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "body_invalido", details: parsed.error.flatten() });
  }

  const { name, sku, price_cents, stock } = parsed.data;

  try {
    const result = await pool.query(
      `
      INSERT INTO products (name, sku, price_cents, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, sku, price_cents, stock]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (String(err.message).includes("duplicate key")) {
      return res.status(409).json({ error: "sku_ja_existe" });
    }

    return res.status(500).json({ error: "erro_interno" });
  }
}

async function listProducts(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: "erro_interno" });
  }
}

async function getProduct(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "produto_nao_encontrado" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: "erro_interno" });
  }
}

module.exports = { createProduct, listProducts, getProduct };
