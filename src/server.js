const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const { env } = require("./config/env");
const { swaggerSpec } = require("./swagger");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Healthcheck da API
 *     responses:
 *       200:
 *         description: API online
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastro de usuário
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login e geração de JWT
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Criar produto
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Listar produtos
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Buscar produto por ID
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Criar pedido com baixa de estoque e cálculo de frete estimado
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /orders/me:
 *   get:
 *     summary: Listar pedidos do usuário autenticado
 *     security:
 *       - bearerAuth: []
 */

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Pedidos + Estoque + Frete",
    docs: "/docs",
    health: "/health"
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.listen(env.port, () => {
  console.log(`API rodando em http://localhost:${env.port}`);
  console.log(`Swagger em http://localhost:${env.port}/docs`);
});
