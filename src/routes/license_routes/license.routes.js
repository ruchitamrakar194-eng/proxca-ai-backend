const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authorize");
const {
  activateLicense,
  validateLicense,
  verifyLicense,
  generateLicense,
  getAllLicenses,
  toggleLicenseStatus,
  updateExpiryDate,
  getLicenseAnalytics,
  getLicenseInsights
} = require("../../controller/license_controller/license.controller");

// License routes
router.post("/license/activate", authenticate, activateLicense);
router.post("/license/validate", authenticate, validateLicense);
router.post("/license/verify", verifyLicense); // No auth required
router.get("/license/generate", authenticate, generateLicense);
router.get("/license/all", authenticate, getAllLicenses);
router.put("/license/toggle/:id", authenticate, toggleLicenseStatus);
router.put("/license/expiry/:id", authenticate, updateExpiryDate);
router.get("/license/analytics", authenticate, getLicenseAnalytics);
router.get("/license/insights", authenticate, getLicenseInsights);

module.exports = router;
