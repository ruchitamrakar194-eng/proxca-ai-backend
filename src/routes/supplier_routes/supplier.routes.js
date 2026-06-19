const express = require("express");
const { add_supplier, get_all_suppliers, update_supplier, delete_supplier, assign_intake_request, delete_assign_intake_request } = require("../../controller/supplier_controller/supplier.controller");
const { add_rating, get_ratings, get_rankings, delete_rating, update_rating } = require("../../controller/supplier_controller/supplier_performance.controller");
const authenticate = require("../../middleware/authorize")
const router = express.Router();
router.post("/add_supplier", authenticate, add_supplier)
router.get("/get_all_suppliers", authenticate, get_all_suppliers)
router.patch("/update_supplier/:id", authenticate, update_supplier)
router.delete("/delete_supplier/:id", authenticate, delete_supplier)
router.post("/assign_intake_request", authenticate, assign_intake_request)
router.delete("/delete_assign_intake_request/:id", delete_assign_intake_request)

router.post("/add_rating", authenticate, add_rating)
router.get("/get_ratings", authenticate, get_ratings)
router.get("/get_rankings", authenticate, get_rankings)
router.delete("/delete_rating/:id", authenticate, delete_rating)
router.put("/update_rating/:id", authenticate, update_rating)

module.exports = router;