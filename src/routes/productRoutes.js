const express = require("express");
const { createProduct, listProducts, getProduct } = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createProduct);
router.get("/", listProducts);
router.get("/:id", getProduct);

module.exports = router;
