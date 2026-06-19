const { Op } = require("sequelize");
const db = require("../../config/config");
const moment = require("moment");

/**
 * Gathers a comprehensive snapshot of project statistics
 * to provide context for the chatbot.
 * 
 * @param {Object} whereClause - The base filter (e.g. { userId: 123 })
 * @returns {Object} - An object containing all counts and stats
 */
const getProjectSnapshot = async (whereClause) => {
    try {
        const [
            totalIntake,
            pendingIntake,
            approvedIntake,
            activeIntake,
            rejectedIntake,
            totalContracts,
            activeContracts,
            expiringSoonContracts,
            totalSpend,
            transactionCount,
            totalSavings,
            totalInventory,
            lowStockInventory,
            totalLicenses,
            thirdPartyLicenses,
            totalDepts,
            totalTemplates,
            pendingApprovals,
            totalRenewals,
            totalRenewalNotes,
            totalSuppliers
        ] = await Promise.all([
            // 1. Intake Stats
            db.intake_request.count({ where: whereClause }),
            db.intake_request.count({ where: { ...whereClause, status: 'pending' } }),
            db.intake_request.count({ where: { ...whereClause, status: 'approved' } }),
            db.intake_request.count({ where: { ...whereClause, status: 'active' } }),
            db.intake_request.count({ where: { ...whereClause, status: 'rejected' } }),
            
            // 2. Contract Stats
            db.contract.count({ where: whereClause }),
            db.contract.count({ where: { ...whereClause, status: 'Active' } }),
            db.contract.count({
                where: {
                    ...whereClause,
                    endDate: { [Op.between]: [moment().toDate(), moment().add(30, 'days').toDate()] }
                }
            }),

            // 3. Spend Stats
            db.transaction.sum('amount', { where: whereClause }) || 0,
            db.transaction.count({ where: whereClause }),

            // 4. Cost Savings
            db.costSaving.sum('estimatedSavings', { where: whereClause }) || 0,

            // 5. Inventory
            db.inventory.count({ where: whereClause }),
            db.inventory.count({ where: { ...whereClause, quantity: { [Op.lt]: 10 } } }),

            // 6. Licenses (Internal and Third-Party)
            db.license.count({ where: whereClause }),
            db.client_license.count({ where: whereClause }),

            // 7. Departments
            db.department.count({ where: whereClause }),

            // 8. Templates
            db.contract_template.count({ where: whereClause }),

            // 9. Approval Workflow (Pending approvals across all modules)
            db.intake_request_approvers.count({ where: { ...whereClause, status: 'pending' } }),

            // 10. Renewal Management
            db.renewal_request.count({ where: whereClause }),
            db.renewal_notification.count({ where: whereClause }),

            // 11. Supplier Performance
            db.supplier.count({ where: whereClause })
        ]);

        return {
            intake: {
                total: totalIntake,
                pending: pendingIntake,
                approved: approvedIntake,
                active: activeIntake,
                rejected: rejectedIntake
            },
            contracts: {
                total: totalContracts,
                active: activeContracts,
                expiringSoon: expiringSoonContracts
            },
            spend: {
                total: totalSpend,
                transactions: transactionCount
            },
            savings: {
                total: totalSavings
            },
            inventory: {
                total: totalInventory,
                lowStock: lowStockInventory
            },
            licenses: {
                total: totalLicenses,
                thirdParty: thirdPartyLicenses
            },
            departments: {
                total: totalDepts
            },
            templates: {
                total: totalTemplates
            },
            approvals: {
                pending: pendingApprovals
            },
            renewals: {
                total: totalRenewals,
                notifications: totalRenewalNotes
            },
            suppliers: {
                total: totalSuppliers
            }
        };
    } catch (error) {
        console.error("Error gathering stats snapshot:", error);
        return null;
    }
};

module.exports = {
    getProjectSnapshot
};
