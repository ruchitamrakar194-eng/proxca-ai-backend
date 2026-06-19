
const express = require("express");
const { 
  createCostSaving, 
  getAllCostSavings, 
  getCostSavingById, 
  updateCostSaving, 
  deleteCostSaving 
} = require("../../controller/costSaving_controller/costSaving.controller");
const authenticate = require("../../middleware/authorize");
const router = express.Router();

router.use(authenticate);

router.post("/createCostSaving", createCostSaving);
router.get("/getAllCostSavings", getAllCostSavings);
router.get("/getCostSavingById/:id", getCostSavingById);
router.patch("/updateCostSaving/:id", updateCostSaving);
router.delete("/deleteCostSaving/:id", deleteCostSaving);

module.exports = router;
