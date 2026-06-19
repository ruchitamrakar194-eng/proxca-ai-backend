const express = require("express")
const router = express.Router()
const { 
    createEmailTemplate, 
    getAllEmailTemplates, 
    updateEmailTemplate, 
    deleteEmailTemplate 
} = require("../../controller/renewal_notification_controller/email_template.controller")
const authenticate = require("../../middleware/authorize")

// CRUD for Email Templates
router.post("/create_email_template", authenticate, createEmailTemplate)
router.get("/get_all_email_templates", authenticate, getAllEmailTemplates)
router.put("/update_email_template/:id", authenticate, updateEmailTemplate)
router.delete("/delete_email_template/:id", authenticate, deleteEmailTemplate)

module.exports = router
