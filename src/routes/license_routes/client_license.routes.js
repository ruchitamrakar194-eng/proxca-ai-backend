const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authorize");
const {
    createClientLicense,
    getAllClientLicenses,
    assignLicense,
    getLicenseReport
} = require("../../controller/license_controller/client_license.controller");

// Client License routes
router.post("/client-license/create", authenticate, createClientLicense);
router.get("/client-license/all", authenticate, getAllClientLicenses);
router.post("/client-license/assign", authenticate, assignLicense);
router.get("/client-license/report", authenticate, getLicenseReport);

module.exports = router;
