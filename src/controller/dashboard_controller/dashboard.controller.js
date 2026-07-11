const { Op, Sequelize } = require("sequelize");
const db = require('../../../config/config');
const Transaction = db.transaction;
const Category = db.category;
const Supplier = db.supplier;
const IntakeRequest = db.intake_request; // Assuming you have this model
const Contract = db.contract; // Assuming you have this model
const moment = require('moment');

const get_dashboard_data = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';

        let transactionWhereClause = {};
        let intakeWhereClause = {};
        let contractWhereClause = {};

        if (isSuperAdmin) {
            // all access
        } else if (userType === 'department') {
            transactionWhereClause = { departmentId: userId };
            intakeWhereClause = { requesterDepartmentId: userId };
            contractWhereClause = { departmentId: userId };
        } else {
            transactionWhereClause = { userId: userId };
            intakeWhereClause = { userId: userId };
            contractWhereClause = { userId: userId };
        }

        const endDate = new Date();
        const startOfSixMonths = new Date();
        startOfSixMonths.setMonth(endDate.getMonth() - 5); // Last 6 months

        // 1. Summary Counts
        const totalTransactions = await Transaction.count({ where: transactionWhereClause });
        const uniqueSuppliers = await Transaction.count({
            distinct: true,
            col: "supplierId",
            where: transactionWhereClause
        });
        const totalIntakeRequests = await IntakeRequest.count({ where: intakeWhereClause });

        // Projects Completed: Intake Requests that have been fully approved by the workflow
        const projectsCompleted = await IntakeRequest.count({
            where: { ...intakeWhereClause, status: 'approved' }
        });

        // Projects Pending: Intake Requests that are in 'pending' status
        const projectsPending = await IntakeRequest.count({
            where: { ...intakeWhereClause, status: 'pending' }
        });

        // Projects Active: Intake Requests that are in 'active' status
        const projectsActive = await IntakeRequest.count({
            where: { ...intakeWhereClause, status: 'active' }
        });

        const expiringContractsCount = await Contract.count({
            where: {
                endDate: { [Op.between]: [moment().toDate(), moment().add(30, 'days').toDate()] },
                ...contractWhereClause
            },
        });

        // 2. Top Suppliers (Bar Chart Data)
        const topSuppliers = await Transaction.findAll({
            attributes: [
                "supplierId",
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
            ],
            include: [{ model: Supplier, as: "supplier", attributes: ["name"] }],
            where: { ...transactionWhereClause },
            group: ["supplierId", "supplier.name"],
            order: [[Sequelize.fn("SUM", Sequelize.col("amount")), "DESC"]],
            limit: 5,
            raw: true,
        });

        const barGraphData = topSuppliers.map((s) => ({
            topSupplier: s["supplier.name"],
            totalAmount: parseFloat(s.totalAmount),
        }));

        // 3. Spend Dashboard - Monthly (Last 6 Months)
        const monthlyCategoryData = await Transaction.findAll({
            attributes: [
                [Sequelize.fn("DATE_FORMAT", Sequelize.col("dateOfTransaction"), "%b %Y"), "month"],
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
                [Sequelize.col("category.name"), "categoryName"],
            ],
            include: [{ model: Category, as: "category", attributes: [] }],
            where: {
                ...transactionWhereClause,
                dateOfTransaction: { [Op.between]: [startOfSixMonths, endDate] }
            },
            group: ["month", "categoryId", "category.name"],
            order: [[Sequelize.fn("MIN", Sequelize.col("dateOfTransaction")), "ASC"]],
            raw: true,
        });

        // 4. Spend Dashboard - Yearly (Current Year)
        const yearlyCategoryData = await Transaction.findAll({
            attributes: [
                [Sequelize.fn("SUM", Sequelize.col("amount")), "totalAmount"],
                [Sequelize.col("category.name"), "categoryName"],
            ],
            include: [{ model: Category, as: "category", attributes: [] }],
            where: {
                ...transactionWhereClause,
                dateOfTransaction: {
                    [Op.between]: [moment().startOf('year').toDate(), moment().endOf('year').toDate()]
                }
            },
            group: ["categoryId", "category.name"],
            raw: true,
        });

        // 5. Coming Renewals in next 6 months (Detailed List Grouped by Department)
        const sixMonthsFromNow = moment().add(6, 'months').toDate();
        const comingRenewalsDetails = await Contract.findAll({
            where: {
                endDate: { [Op.between]: [moment().toDate(), sixMonthsFromNow] },
                ...contractWhereClause
            },
            attributes: ['id', 'contractName', 'endDate'],
            include: [
                { model: db.department, as: "department", attributes: ["name"] },
                { model: Supplier, as: "supplier", attributes: ["name"] }
            ],
            order: [['endDate', 'ASC']],
            raw: true
        });

        // Transform renewal data for easier frontend grouping
        const formattedRenewals = comingRenewalsDetails.map(r => ({
            id: r.id,
            contractName: r.contractName,
            endDate: r.endDate,
            departmentName: r["department.name"],
            supplierName: r["supplier.name"]
        }));

        return res.status(200).json({
            status: true,
            message: "Dashboard analytics fetched successfully",
            summary: {
                totalSpendCount: totalTransactions,
                totalSupplierCount: uniqueSuppliers,
                totalIntakeRequests: totalIntakeRequests,
                totalExpiringContracts: expiringContractsCount,
                projectsCompleted: projectsCompleted,
                projectsPending: projectsPending,
                projectsActive: projectsActive,
            },
            topSuppliers: barGraphData,
            categoryDataMonthly: monthlyCategoryData,
            categoryDataYearly: yearlyCategoryData,
            comingRenewals: formattedRenewals
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    get_dashboard_data
};

