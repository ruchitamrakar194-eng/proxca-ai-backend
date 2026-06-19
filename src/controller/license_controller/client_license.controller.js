const db = require("../../../config/config");
const { client_license, client_license_assignment, department, user } = db;

// Create a new client license
exports.createClientLicense = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await client_license.create({ ...req.body, userId });
        res.status(201).json({ status: true, data, message: "Client license created successfully" });
    } catch (error) {
        console.error("Error creating client license:", error);
        res.status(500).json({ status: false, message: error.message });
    }
};

// Get all client licenses with department and assignment details
exports.getAllClientLicenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await client_license.findAll({
            where: { userId },
            include: [
                { model: department, as: 'department', attributes: ['name'] },
                {
                    model: client_license_assignment,
                    as: 'assignments',
                    include: [{ model: user, as: 'user', attributes: ['first_name', 'last_name', 'email_id'] }]
                }
            ]
        });
        res.status(200).json({ status: true, data });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Assign a license to a user
exports.assignLicense = async (req, res) => {
    try {
        const { client_license_id, user_id, user_name } = req.body;

        // Check if license exists and has capacity
        const license = await client_license.findByPk(client_license_id);
        if (!license) return res.status(404).json({ status: false, message: "License not found" });

        if (license.used_licenses >= license.total_licenses) {
            return res.status(400).json({ status: false, message: "No more licenses available for assignment" });
        }

        const assignment = await client_license_assignment.create({
            client_license_id,
            user_id,
            user_name
        });

        // Update used count
        await license.increment('used_licenses');

        res.status(201).json({ status: true, data: assignment, message: "License assigned successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// Get usage report
exports.getLicenseReport = async (req, res) => {
    try {
        const report = await client_license.findAll({
            attributes: [
                'license_name',
                'total_licenses',
                'used_licenses',
                [db.sequelize.literal('total_licenses - used_licenses'), 'unused_licenses']
            ],
            include: [{ model: department, as: 'department', attributes: ['name'] }]
        });
        res.status(200).json({ status: true, data: report });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
