const express = require("express")

const router = express.Router()
const { uploads } = require("../../middleware/multer")
const authenticate = require("../../middleware/authorize")
const { add_contract_template, get_all_contract_templates, update_contract_template, delete_contract_template, generate_contract_preview } = require("../../controller/contract_template_controller/contract_template.controller")

// 🔄 Contract Renewal Controllers
const {
    renew_contract_from_template,
    get_contract_for_renewal,
    preview_renewed_contract,
    get_contracts_expiring_soon
} = require("../../controller/contract_template_controller/contract_renewal.controller")

// Template CRUD
router.post("/add_contract_template", authenticate, uploads.single("customAgreementFile"), add_contract_template)
router.get("/get_all_contract_templates", authenticate, get_all_contract_templates)
router.patch("/update_contract_template/:id", authenticate, update_contract_template)
router.delete("/delete_contract_template/:id", authenticate, delete_contract_template)
router.post("/generate_contract_preview/:id", authenticate, generate_contract_preview)

// 🔄 Contract Renewal Routes
router.post("/renew_contract/:contractId/:templateId", authenticate, renew_contract_from_template)
router.get("/get_contract_for_renewal/:id", authenticate, get_contract_for_renewal)
router.post("/preview_renewed_contract/:templateId", authenticate, preview_renewed_contract)
router.get("/get_contracts_expiring_soon", authenticate, get_contracts_expiring_soon)

module.exports = router