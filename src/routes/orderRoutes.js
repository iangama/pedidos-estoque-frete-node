const express = require("express");
const { createOrder, listMyOrders } = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/me", authMiddleware, listMyOrders);

module.exports = router;
