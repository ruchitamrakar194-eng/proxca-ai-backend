const express = require("express")

const router = express.Router()
const { add_notification } = require("../../controller/renewal_notification_controller/renewal_notification.controller")
const { 
    getContractsForNotification, 
    saveContractPreference, 
    getContractPreference,
    getAllContractPreferences,
    deleteContractPreference
} = require("../../controller/renewal_notification_controller/contract_preference.controller")
const authenticate = require("../../middleware/authorize")


router.post("/add_notification" , add_notification)

// Contract Specific Preferences
router.get("/getContractsForNotification", authenticate, getContractsForNotification)
router.post("/saveContractPreference", authenticate, saveContractPreference)
router.get("/getContractPreference/:id", authenticate, getContractPreference)
router.get("/getAllContractPreferences", authenticate, getAllContractPreferences)
router.delete("/deleteContractPreference/:id", authenticate, deleteContractPreference)

module.exports = router