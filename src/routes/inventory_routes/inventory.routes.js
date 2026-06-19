const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authorize");
const {
    createInventoryItem,
    getAllInventoryItems,
    updateStock,
    getLowStockAlerts
} = require("../../controller/inventory_controller/inventory.controller");

// Inventory routes
router.post("/inventory/create", authenticate, createInventoryItem);
router.get("/inventory/all", authenticate, getAllInventoryItems);
router.put("/inventory/update/:id", authenticate, updateStock);
router.get("/inventory/alerts", authenticate, getLowStockAlerts);

module.exports = router;
