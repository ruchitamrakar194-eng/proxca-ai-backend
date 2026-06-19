const db = require('../../../config/config');
const ContractTemplate = db.contract_template;
const Contract = db.contract;
const Supplier = db.supplier;
const Department = db.department;

/**
 * 🔄 RENEW CONTRACT FROM TEMPLATE
 * Creates a new contract version based on existing contract + template
 */
const renew_contract_from_template = async (req, res) => {
    try {
        const { contractId, templateId } = req.params;
        const {
            supplierName,
            companyName,
            startDate,
            endDate,
            contractDuration,
            budget,
            additionalFields, // Any extra dynamic fields
        } = req.body;

        // 1. Fetch original contract
        const originalContract = await Contract.findByPk(contractId, {
            include: [
                { model: Supplier, as: 'supplier' },
                { model: Department, as: 'department' }
            ]
        });

        if (!originalContract) {
            return res.status(404).json({
                success: false,
                message: 'Original contract not found'
            });
        }

        // 2. Fetch template
        const template = await ContractTemplate.findByPk(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Contract template not found'
            });
        }

        // 3. Prepare dynamic data for replacement
        const dynamicData = {
            SupplierName: supplierName || originalContract.supplier?.name || 'N/A',
            CompanyName: companyName || 'Kian Developers',
            StartDate: startDate || new Date().toISOString().split('T')[0],
            EndDate: endDate,
            ContractDuration: contractDuration || '12 months',
            Budget: budget || originalContract.budget || '0',
            Currency: originalContract.currency || 'USD',
            ContractName: originalContract.contractName,
            Department: originalContract.department?.name || 'N/A',
            ...additionalFields // Merge any additional fields
        };

        // 4. Replace placeholders in template content
        let renewedContent = template.templateContent || '';
        Object.keys(dynamicData).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            renewedContent = renewedContent.replace(regex, dynamicData[key] || '');
        });

        // 5. Create renewed contract
        const renewedContract = await Contract.create({
            contractName: `${originalContract.contractName} - Renewed`,
            description: `Renewed contract from ${originalContract.contractName}`,
            contractTypeId: originalContract.contractTypeId,
            departmentId: originalContract.departmentId,
            startDate: startDate || new Date(),
            endDate: endDate,
            sourceLeadName: originalContract.sourceLeadName,
            sourceDirectorName: originalContract.sourceDirectorName,
            buisnessStackHolder: originalContract.buisnessStackHolder,
            supplierId: originalContract.supplierId,
            agreementId: templateId, // Link to template
            budget: budget || originalContract.budget,
            currency: originalContract.currency,
            paymentTerms: originalContract.paymentTerms,
            milestones: originalContract.milestones,
            userId: req.user.id,
            status: 'Active',
            // Store the generated content (if needed)
            contractAttachmentFile: null, // Can generate PDF here
        });

        // 6. Update original contract status to 'Renewed'
        await originalContract.update({ status: 'Renewed' });

        return res.status(201).json({
            success: true,
            message: 'Contract renewed successfully',
            data: {
                renewedContract,
                generatedContent: renewedContent,
                originalContractId: contractId,
            }
        });

    } catch (error) {
        console.error('Error renewing contract:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to renew contract',
            error: error.message
        });
    }
};

/**
 * 📄 GET CONTRACT FOR RENEWAL
 * Fetches contract details with all related data for renewal form
 */
const get_contract_for_renewal = async (req, res) => {
    try {
        const { id } = req.params;

        const contract = await Contract.findByPk(id, {
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name', 'email', 'contactPerson']
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        // Calculate days until expiry
        const endDate = new Date(contract.endDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        return res.status(200).json({
            success: true,
            message: 'Contract details fetched successfully',
            data: {
                contract,
                daysUntilExpiry,
                isExpiringSoon: daysUntilExpiry <= 30,
                isExpired: daysUntilExpiry < 0
            }
        });

    } catch (error) {
        console.error('Error fetching contract for renewal:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch contract details'
        });
    }
};

/**
 * 🔍 PREVIEW RENEWED CONTRACT
 * Generates preview without saving
 */
const preview_renewed_contract = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { formData } = req.body;

        const template = await ContractTemplate.findByPk(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        let content = template.templateContent || '';

        // Replace placeholders
        if (formData) {
            Object.keys(formData).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                content = content.replace(regex, formData[key] || '');
            });
        }

        return res.status(200).json({
            success: true,
            type: 'html',
            content,
            templateName: template.aggrementName
        });

    } catch (error) {
        console.error('Error generating preview:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate preview'
        });
    }
};

/**
 * 📊 GET CONTRACTS EXPIRING SOON
 * For renewal dashboard
 */
const get_contracts_expiring_soon = async (req, res) => {
    try {
        const { days = 60 } = req.query; // Increase default to 60 as per UI
        const userId = req.user.id;
        const userType = req.user.userType;

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + parseInt(days));

        let whereCondition = {
            endDate: {
                [db.Sequelize.Op.between]: [today, futureDate]
            },
            status: 'Active'
        };

        // Admin sees only their contracts
        if (userType !== 'superadmin') {
            whereCondition.userId = userId;
        }

        const expiringContracts = await Contract.findAll({
            where: whereCondition,
            include: [
                { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
                { model: Department, as: 'department', attributes: ['id', 'name'] }
            ],
            order: [['endDate', 'ASC']]
        });

        // Add days until expiry for each contract
        const contractsWithExpiry = expiringContracts.map(contract => {
            const endDate = new Date(contract.endDate);
            const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            return {
                ...contract.toJSON(),
                daysUntilExpiry,
                urgencyLevel: daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 15 ? 'high' : 'medium'
            };
        });

        // --- CALCULATE ANALYTICS ---

        // 1. Total Expiring (within specified days)
        const totalExpiring = expiringContracts.length;

        // 2. Renewed (MTD) - Contracts renewed in the current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let renewedWhere = {
            status: 'Renewed',
            updatedAt: { [db.Sequelize.Op.gte]: startOfMonth }
        };
        if (userType !== 'superadmin') renewedWhere.userId = userId;
        const renewedThisMonth = await Contract.count({ where: renewedWhere });

        // 3. Critical Actions (Expiring within 7 days)
        const criticalActions = contractsWithExpiry.filter(c => c.daysUntilExpiry <= 7).length;

        // 4. Potential Savings (Sum of budgets for expiring contracts - simplified model)
        const savingsSum = expiringContracts.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0) * 0.1; // Estimate 10% savings
        const potentialSavings = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingsSum);

        // 5. Distribution by Department
        const distributionMap = {};
        expiringContracts.forEach(c => {
            const deptName = c.department?.name || 'Other';
            distributionMap[deptName] = (distributionMap[deptName] || 0) + 1;
        });

        const totalForDist = Object.values(distributionMap).reduce((a, b) => a + b, 0);
        const distribution = Object.keys(distributionMap).map(name => ({
            name,
            percentage: Math.round((distributionMap[name] / totalForDist) * 100) || 0
        })).sort((a, b) => b.percentage - a.percentage);

        // 6. Completion Rate (Renewed vs Total)
        const totalRelevant = renewedThisMonth + totalExpiring;
        const completionRate = totalRelevant > 0 ? Math.round((renewedThisMonth / totalRelevant) * 100) : 0;

        return res.status(200).json({
            success: true,
            message: 'Expiring contracts and analytics fetched successfully',
            data: contractsWithExpiry,
            analytics: {
                totalExpiring,
                renewedThisMonth,
                criticalActions,
                potentialSavings,
                completionRate
            },
            distribution,
            count: totalExpiring
        });

    } catch (error) {
        console.error('Error fetching expiring contracts:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expiring contracts',
            error: error.message
        });
    }
};

module.exports = {
    renew_contract_from_template,
    get_contract_for_renewal,
    preview_renewed_contract,
    get_contracts_expiring_soon
};
