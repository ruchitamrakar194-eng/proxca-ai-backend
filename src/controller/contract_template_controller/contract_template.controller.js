const db = require('../../../config/config');
const ContractTemplate = db.contract_template;
const { Op } = require('sequelize');

// Add contract template
const add_contract_template = async (req, res) => {
  try {
    const {
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
      aggrementName,
      templateContent, // <--- New field
    } = req.body;

    const customAgreementFile = req.file?.path
      ? req.file.path.replace(/^.*?public[\\/]/, '')
      : null;

    const template = await ContractTemplate.create({
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
      customAgreementFile,
      aggrementName,
      templateContent, // <--- Save it
      admin_id: (req.user.userType === 'admin' || req.user.userType === 'department') ? req.user.id : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Contract template added successfully.',
      template,
    });
  } catch (error) {
    console.error('Error adding contract template:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Generate Preview (Dynamic Data Binding)
const generate_contract_preview = async (req, res) => {
  try {
    const { id } = req.params;
    const { formData } = req.body; // { VendorName: "IBM", StartDate: "2024-01-01", ... }

    const template = await ContractTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    let content = template.templateContent || "";

    if (!content && template.customAgreementFile) {
      // If no HTML content but file exists, we can't really replace text easily without complex parsing.
      // Return a message or the file url.
      return res.status(200).json({
        success: true,
        type: 'file',
        url: template.customAgreementFile,
        message: "This template is file-based. Dynamic preview not supported."
      });
    }

    // Dynamic Replacement logic
    // Expects placeholders like {{VendorName}}
    if (formData) {
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        // Replace all occurrences
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value || "");
      });
    }

    return res.status(200).json({
      success: true,
      type: 'html',
      content,
    });

  } catch (error) {
    console.error('Error generating preview:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// Get all contract templates
const get_all_contract_templates = async (req, res) => {
  try {
    let whereCondition = {};

    if (req.user.userType === 'admin') {
      whereCondition[Op.or] = [
        { admin_id: req.user.id },
        { admin_id: null }
      ];
    } else if (req.user.userType === 'department') {
      whereCondition.admin_id = req.user.id;
    }

    const templates = await ContractTemplate.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Contract templates retrieved successfully.',
      templates,
    });
  } catch (error) {
    console.error('Error fetching contract templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Get contract template by ID
const get_contract_template_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    let whereCondition = { id };

    if (req.user.userType === 'admin' || req.user.userType === 'department') {
      whereCondition.admin_id = req.user.id;
    }

    const template = await ContractTemplate.findOne({
      where: whereCondition,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Contract template not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contract template retrieved successfully.',
      template,
    });
  } catch (error) {
    console.error('Error fetching contract template:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Update contract template by ID
const update_contract_template = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
    } = req.body;

    const customAgreementFile = req.file?.path
      ? req.file.path.replace(/^.*?public[\\/]/, '')
      : null;

    let whereCondition = { id };

    if (req.user.userType === 'admin' || req.user.userType === 'department') {
      whereCondition.admin_id = req.user.id;
    }

    const template = await ContractTemplate.findOne({
      where: whereCondition,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Contract template not found.',
      });
    }

    await template.update({
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
      customAgreementFile,
    });

    return res.status(200).json({
      success: true,
      message: 'Contract template updated successfully.',
      template,
    });
  } catch (error) {
    console.error('Error updating contract template:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Delete contract template by ID
const delete_contract_template = async (req, res) => {
  try {
    const { id } = req.params;

    let whereCondition = { id };

    if (req.user.userType === 'admin' || req.user.userType === 'department') {
      whereCondition.admin_id = req.user.id;
    }

    const template = await ContractTemplate.findOne({
      where: whereCondition,
    });

    if (!template) {
      return res.status(404).json({
        status: false,
        message: 'Contract template not found.',
      });
    }

    // Nullify references in linked contracts to allow deletion
    await db.contract.update(
      { agreementId: null },
      { where: { agreementId: id } }
    );

    // Nullify references in linked intake requests to allow deletion
    await db.intake_request.update(
      { assigncontractTemplateId: null },
      { where: { assigncontractTemplateId: id } }
    );

    await template.destroy();

    return res.status(200).json({
      status: true,
      message: 'Contract template deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting contract template:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};


module.exports = {
  add_contract_template,
  get_all_contract_templates,
  get_contract_template_by_id,
  update_contract_template,
  delete_contract_template,
  generate_contract_preview,
};
