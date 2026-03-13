const { z } = require("zod");
const { pool } = require("../config/db");
const { fetchAddressByCep } = require("../services/viacepService");
const { estimateFreightCents } = require("../services/freightService");

const createOrderSchema = z.object({
  delivery_cep: z.string().min(8),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      qty: z.number().int().positive()
    })
  ).min(1)
});

async function createOrder(req, res) {
  const parsed = createOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "body_invalido", details: parsed.error.flatten() });
  }

  const { delivery_cep, items } = parsed.data;
  const userId = req.user.sub;

  try {
    const cepData = await fetchAddressByCep(delivery_cep);

    if (!cepData.ok) {
      if (cepData.type === "invalid_cep_format") {
        return res.status(400).json({ error: "cep_invalido" });
      }

      if (cepData.type === "cep_not_found") {
        return res.status(404).json({ error: "cep_nao_encontrado" });
      }

      return res.status(502).json({ error: "falha_consulta_cep" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const productIds = items.map(i => i.product_id);

      const productsResult = await client.query(
        `
        SELECT id, name, price_cents, stock
        FROM products
        WHERE id = ANY($1::uuid[])
        FOR UPDATE
        `,
        [productIds]
      );

      if (productsResult.rowCount !== productIds.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "produto_invalido_no_pedido" });
      }

      const productMap = new Map(productsResult.rows.map(p => [p.id, p]));

      let subtotalCents = 0;

      for (const item of items) {
        const product = productMap.get(item.product_id);

        if (!product) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "produto_invalido_no_pedido" });
        }

        if (product.stock < item.qty) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: "estoque_insuficiente",
            product_id: item.product_id,
            stock_disponivel: product.stock
          });
        }

        subtotalCents += product.price_cents * item.qty;
      }

      const freightCents = estimateFreightCents(cepData.state, subtotalCents);
      const totalCents = subtotalCents + freightCents;

      const orderResult = await client.query(
        `
        INSERT INTO orders (
          user_id,
          delivery_cep,
          delivery_city,
          delivery_state,
          subtotal_cents,
          freight_cents,
          total_cents
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          userId,
          String(delivery_cep).replace(/\D/g, ""),
          cepData.city,
          cepData.state,
          subtotalCents,
          freightCents,
          totalCents
        ]
      );

      const order = orderResult.rows[0];

      for (const item of items) {
        const product = productMap.get(item.product_id);
        const lineTotal = product.price_cents * item.qty;

        await client.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            qty,
            unit_price_cents,
            line_total_cents
          )
          VALUES ($1, $2, $3, $4, $5)
          `,
          [order.id, item.product_id, item.qty, product.price_cents, lineTotal]
        );

        await client.query(
          `
          UPDATE products
          SET stock = stock - $1
          WHERE id = $2
          `,
          [item.qty, item.product_id]
        );
      }

      await client.query("COMMIT");

      return res.status(201).json({
        order,
        shipping_address: {
          cep: cepData.cep,
          city: cepData.city,
          state: cepData.state,
          street: cepData.street,
          neighborhood: cepData.neighborhood
        }
      });
    } catch (err) {
      await client.query("ROLLBACK");
      return res.status(500).json({ error: "erro_interno" });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: "erro_interno" });
  }
}

async function listMyOrders(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.sub]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: "erro_interno" });
  }
}

module.exports = { createOrder, listMyOrders };
