const db = require("../../../config/config");
const User = db.user;
const Department = db.department;
const bcrypt = require("bcryptjs");

exports.get_profile = async (req, res) => {
    try {
        const { id, userType } = req.user;
        let userData;
        if (userType === 'department') {
            userData = await Department.findByPk(id, {
                attributes: { exclude: ['password', 'refreshToken', 'refreshToken_Expiration'] }
            });
        } else {
            userData = await User.findByPk(id, {
                attributes: { exclude: ['password', 'refreshToken', 'refreshToken_Expiration', 'resetToken', 'resetTokenExpiry'] }
            });
        }

        if (!userData) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        return res.status(200).json({ status: true, data: userData });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.update_profile = async (req, res) => {
    try {
        const { id, userType } = req.user;
        const { first_name, last_name, phone_no, country, city, state, name } = req.body;

        let userData;
        if (userType === 'department') {
            userData = await Department.findByPk(id);
            if (!userData) return res.status(404).json({ status: false, message: "Department not found" });
            if (name) userData.name = name;
        } else {
            userData = await User.findByPk(id);
            if (!userData) return res.status(404).json({ status: false, message: "User not found" });
            if (first_name) userData.first_name = first_name;
            if (last_name) userData.last_name = last_name;
            if (phone_no) userData.phone_no = phone_no;
            if (country) userData.country = country;
            if (city) userData.city = city;
            if (state) userData.state = state;
        }

        await userData.save();
        return res.status(200).json({ status: true, message: "Profile updated successfully", data: userData });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

exports.change_password = async (req, res) => {
    try {
        const { id, userType } = req.user;
        const { old_password, new_password } = req.body;

        if (!old_password || !new_password) {
            return res.status(400).json({ status: false, message: "Old and new password are required" });
        }

        let userData;
        if (userType === 'department') {
            userData = await Department.findByPk(id);
        } else {
            userData = await User.findByPk(id);
        }

        if (!userData) return res.status(404).json({ status: false, message: "User not found" });

        const isMatch = await bcrypt.compare(old_password, userData.password);
        if (!isMatch) {
            return res.status(400).json({ status: false, message: "Invalid old password" });
        }

        userData.password = await bcrypt.hash(new_password, 10);
        await userData.save();

        return res.status(200).json({ status: true, message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
