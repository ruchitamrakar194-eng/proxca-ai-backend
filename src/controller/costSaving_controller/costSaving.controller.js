const db = require('../../../config/config');
const CostSaving = db.costSaving;
// Create a new Cost Saving entry
exports.createCostSaving = async (req, res) => {
  try {
    const {
      supplierName,
      requesterName,
      departmentId,
      group,
      category,
      reportingYear,
      currency,
      benefitStartMonth,
      benefitEndMonth,
      typeOfCostSaving,
      historicalUnitPrice,
      negotiatedUnitPrice,
      reductionPerUnit,
      currentPrice,
      proposedPrice,
      notesDescription,
      forecastVolumes,
      forecastVolumesMultiYear,
      historicalUnitPrices,
      additionalColumns,
      sourcingBenefits,
      intakeRequest
    } = req.body;
 
    const userId = req.user.id;
 
    const newEntry = await CostSaving.create({
      supplierName,
      requesterName,
      departmentId,
      group: group || "N/A",
      category,
      reportingYear,
      currency,
      benefitStartMonth,
      benefitEndMonth,
      typeOfCostSaving,
      historicalUnitPrice,
      negotiatedUnitPrice,
      reductionPerUnit,
      currentPrice,
      proposedPrice,
      notesDescription,
      forecastVolumes,
      forecastVolumesMultiYear,
      historicalUnitPrices,
      additionalColumns,
      sourcingBenefits,
      intakeRequest,
      userId
    });

    return res.status(201).json({ message: 'Cost Saving created successfully', data: newEntry ,status:true});
  } catch (error) {
    console.error('Create Error:', error);
    return res.status(500).json({ message: 'Failed to create cost saving', error , status:false });
  }
};

// Get all cost saving entries with filtering options
exports.getAllCostSavings = async (req, res) => {
  try {
    const { userType, id: userId } = req.user;
    const { 
      category, 
      departmentId, 
      supplierName, 
      reportingYear, 
      benefitStartMonth, 
      minAmount, 
      maxAmount, 
      startDate, 
      endDate,
      signerId 
    } = req.query;

    let whereClause = {};

    // Standard RBAC: Admin only sees their own entries
    if (userType === 'admin') {
      whereClause.userId = userId;
    }

    // Apply basic filters
    if (category) whereClause.category = category;
    if (supplierName) whereClause.supplierName = { [db.Sequelize.Op.like]: `%${supplierName}%` };
    if (reportingYear) whereClause.reportingYear = reportingYear;
    if (benefitStartMonth) whereClause.benefitStartMonth = benefitStartMonth;

    // Amount range filter (on currentPrice)
    if (minAmount || maxAmount) {
      whereClause.currentPrice = {};
      if (minAmount) whereClause.currentPrice[db.Sequelize.Op.gte] = minAmount;
      if (maxAmount) whereClause.currentPrice[db.Sequelize.Op.lte] = maxAmount;
    }

    // Date range filter (on createdAt)
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[db.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt[db.Sequelize.Op.lte] = end;
      }
    }

    // Associations to include for filtering and display
    let includes = [
      {
        model: db.department,
        as: 'departmentDetails', // Make sure this alias exists in association.js
        required: departmentId ? true : false,
        ...(departmentId && { where: { id: departmentId } })
      },
      {
        model: db.intake_request,
        as: 'intakeRequestDetails',
        include: [
          {
            model: db.intake_request_approvers,
            as: 'intakeRequestApprovers',
            required: signerId ? true : false,
            ...(signerId && { where: { userId: signerId } })
          }
        ],
        required: signerId ? true : false
      },
      {
        model: db.supplier,
        as: 'supplierDetails',
        required: false
      }
    ];

    const entries = await CostSaving.findAll({
      where: whereClause,
      include: includes,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(entries);
  } catch (error) {
    console.error('Fetch All Error:', error);
    return res.status(500).json({ message: 'Failed to fetch entries', error: error.message });
  }
};

// Get a single cost saving by ID
exports.getCostSavingById = async (req, res) => {
  try {
    const entry = await CostSaving.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost Saving not found' });
    }
    return res.status(200).json(entry);
  } catch (error) {
    console.error('Fetch By ID Error:', error);
    return res.status(500).json({ message: 'Failed to fetch entry', error });
  }
};

// Update cost saving by ID
exports.updateCostSaving = async (req, res) => {
  try {
    const entry = await CostSaving.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost Saving not found' });
    }

    await entry.update(req.body);

    return res.status(200).json({ message: 'Cost Saving updated', data: entry });
  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({ message: 'Failed to update entry', error });
  }
};

// Delete cost saving by ID
exports.deleteCostSaving = async (req, res) => {
  try {
    const entry = await CostSaving.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost Saving not found' });
    }

    await entry.destroy();
    return res.status(200).json({ message: 'Cost Saving deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ message: 'Failed to delete entry', error });
  }
};
