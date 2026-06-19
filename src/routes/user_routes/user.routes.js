const express = require("express")

const router = express.Router()

const {uploads} = require("../../middleware/multer")

const { user_registration } = require("../../controller/user_controller/registration.controller")
const {  login } = require("../../controller/user_controller/login.controller")
const { forgetPassword, resetPassword } = require("../../controller/user_controller/auth.controller")
const { refresh_token } = require("../../controller/user_controller/refresh_token")
const { check_approval_flow } = require("../../controller/user_controller/checkApprovalFlow")
const { get_profile, update_profile, change_password } = require("../../controller/user_controller/profile.controller")
const authenticate = require("../../middleware/authorize")

router.post("/registration", uploads.single("profile_image"), user_registration)
router.post("/login", login)
router.post("/refresh_token", refresh_token)

router.post("/forget_password", forgetPassword)
router.get("/reset_password", resetPassword)

router.get("/check_approval_flow", authenticate, check_approval_flow)

// Profile Routes
router.get("/get_profile", authenticate, get_profile)
router.patch("/update_profile", authenticate, update_profile)
router.post("/change_password", authenticate, change_password)
module.exports = router