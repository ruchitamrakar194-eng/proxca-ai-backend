const db = require("../../../config/config");
const IntakeRequest = db.intake_request;
const ContractPreference = db.contract_preference;
const InnerDepartment = db.department;
const { Op } = require("sequelize");

// 1. Get List of Contracts for Notification Dropdown
exports.getContractsForNotification = async (req, res) => {
  try {
    const contracts = await IntakeRequest.findAll({
      // We only want approved or active requests that have an end date
      where: {
        status: 'approved',
        endDate: { [Op.ne]: null }
      },
      include: [
        {
          model: InnerDepartment,
          as: 'department', // Ensure this alias matches your association
          attributes: ['name']
        }
      ],
      attributes: ['id', 'requesterName', 'supplierName', 'startDate', 'endDate', 'requestType'],
      order: [['id', 'DESC']]
    });

    return res.status(200).json({
      status: true,
      data: contracts
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 2. Save or Update Notification Preference
exports.saveContractPreference = async (req, res) => {
  try {
    const { intakeRequestId, emailRecipients, reminderDays, emailBody, emailSubject } = req.body;

    if (!intakeRequestId || !emailRecipients || !reminderDays) {
      return res.status(400).json({ status: false, message: "Missing required fields." });
    }

    // Check if preference already exists for this intake
    let preference = await ContractPreference.findOne({ where: { intakeRequestId } });

    if (preference) {
      // Update existing
      await preference.update({
        emailRecipients,
        reminderDays,
        emailBody,
        emailSubject
      });
      return res.status(200).json({ status: true, message: "Preferences updated successfully.", data: preference });
    } else {
      // Create new
      preference = await ContractPreference.create({
        intakeRequestId,
        emailRecipients,
        reminderDays,
        emailBody,
        emailSubject
      });
      return res.status(201).json({ status: true, message: "Preferences saved successfully.", data: preference });
    }
  } catch (error) {
    console.error("Error saving preference:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 3. Get Existing Preference for a Contract
exports.getContractPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const preference = await ContractPreference.findOne({ where: { intakeRequestId: id } });
    return res.status(200).json({ status: true, data: preference });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 4. Get All Saved Preferences
exports.getAllContractPreferences = async (req, res) => {
  try {
    const preferences = await ContractPreference.findAll({
      include: [
        {
          model: IntakeRequest,
          as: 'intakeDetails',
          include: [
            {
              model: InnerDepartment,
              as: 'department',
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      status: true,
      data: preferences
    });
  } catch (error) {
    console.error("Error fetching all preferences:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 5. Delete a Notification Preference
exports.deleteContractPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContractPreference.destroy({ where: { id } });

    if (deleted) {
      return res.status(200).json({ status: true, message: "Preference deleted successfully." });
    } else {
      return res.status(404).json({ status: false, message: "Preference not found." });
    }
  } catch (error) {
    console.error("Error deleting preference:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

