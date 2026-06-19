const { Op } = require("sequelize");
const db = require("../../../config/config");
const EmailTemplate = db.email_template;

// 1. Create a New Template
exports.createEmailTemplate = async (req, res) => {
  try {
    const { templateName, subject, body } = req.body;
    const admin_id = req.user?.id;

    if (!templateName || !body) {
      return res.status(400).json({ status: false, message: "Template Name and Body are required." });
    }

    const template = await EmailTemplate.create({
      templateName,
      subject,
      body,
      admin_id
    });

    return res.status(201).json({ status: true, message: "Template created successfully.", data: template });
  } catch (error) {
    console.error("Error creating template:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 2. Get All Templates
exports.getAllEmailTemplates = async (req, res) => {
  try {
    const admin_id = req.user?.id;
    // Show templates owned by user OR global templates (admin_id is NULL)
    const whereClause = {
      [Op.or]: [
        { admin_id: admin_id || null },
        { admin_id: null }
      ]
    };

    const templates = await EmailTemplate.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ status: true, data: templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 3. Update an Existing Template
exports.updateEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { templateName, subject, body, status } = req.body;

    const template = await EmailTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ status: false, message: "Template not found." });
    }

    await template.update({
      templateName,
      subject,
      body,
      status
    });

    return res.status(200).json({ status: true, message: "Template updated successfully.", data: template });
  } catch (error) {
    console.error("Error updating template:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// 4. Delete a Template
exports.deleteEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EmailTemplate.destroy({ where: { id } });

    if (deleted) {
      return res.status(200).json({ status: true, message: "Template deleted successfully." });
    } else {
      return res.status(404).json({ status: false, message: "Template not found." });
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
