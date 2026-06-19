const express = require("express");
const {
    add_category,
    get_categories,
    update_category,
    delete_category,
} = require("../../controller/category_controller.js/category.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();
router.post("/add_category", authenticate, add_category);
router.get("/get_categories", authenticate, get_categories);
router.post("/update_category/:id", authenticate, update_category);
router.post("/delete_category/:id", authenticate, delete_category);
module.exports = router;